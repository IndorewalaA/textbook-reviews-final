export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

function normalizeIsbn(s: string) {
  return s.replace(/[^0-9Xx]/g, '').toUpperCase();
}

async function resolveCourseId(
  supabase: ReturnType<typeof createAdminClient>,
  opts: { courseId?: string; courseSlug?: string }
) {
  if (opts.courseId) return opts.courseId;
  if (opts.courseSlug) {
    const { data, error } = await supabase
      .from('courses')
      .select('id')
      .eq('slug', opts.courseSlug)
      .single();
    if (error || !data) throw new Error('Course not found for provided slug');
    return data.id as string;
  }
  throw new Error('Missing courseId or courseSlug');
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createAdminClient();

    const ct = req.headers.get('content-type') || '';
    let courseId: string | undefined;
    let courseSlug: string | undefined;
    let title: string | undefined;
    let author: string | undefined;
    let edition: string | null | undefined;
    let isbn: string | null | undefined;
    let imageFile: File | null = null;
    let imageUrl: string | undefined;

    if (ct.includes('multipart/form-data')) {
      const form = await req.formData();
      courseId = (form.get('courseId') as string) || undefined;
      courseSlug = (form.get('courseSlug') as string) || undefined;
      title = (form.get('title') as string) || undefined;
      author = (form.get('author') as string) || undefined;
      edition = ((form.get('edition') as string) || '').trim() || null;
      isbn = ((form.get('isbn') as string) || '').trim() || null;
      imageFile = (form.get('image') as File) || null;
      imageUrl = (form.get('imageUrl') as string) || undefined;
    } else {
      const body = await req.json().catch(() => ({}));
      courseId = body.courseId;
      courseSlug = body.courseSlug;
      title = body.title;
      author = body.author;
      edition = (body.edition ?? null) as string | null;
      isbn = (body.isbn ?? null) as string | null; 
      imageUrl = body.imageUrl;
    }

    if (!title || !author) {
      return NextResponse.json({ error: 'Missing title or author' }, { status: 400 });
    }

    let resolvedCourseId: string;
    try {
      resolvedCourseId = await resolveCourseId(supabase, { courseId, courseSlug });
    } catch (e: any) {
      return NextResponse.json({ error: e?.message || 'Course resolution failed' }, { status: 400 });
    }
    if (isbn) {
      isbn = normalizeIsbn(isbn);
      if (!(isbn.length === 10 || isbn.length === 13)) {
        return NextResponse.json(
          { error: 'ISBN must be 10 or 13 characters (digits, X allowed for ISBN-10).' },
          { status: 400 }
        );
      }
    }
    if (isbn) {
      const { data: existingByIsbn, error: exIsbnErr } = await supabase
        .from('textbooks')
        .select('id')
        .eq('isbn', isbn)
        .maybeSingle();
      if (exIsbnErr) return NextResponse.json({ error: exIsbnErr.message }, { status: 500 });

      if (existingByIsbn) {
        const { data: existingLink } = await supabase
          .from('course_textbooks')
          .select('id')
          .eq('course_id', resolvedCourseId)
          .eq('textbook_id', existingByIsbn.id)
          .maybeSingle();

        if (!existingLink) {
          const { error: linkError } = await supabase
            .from('course_textbooks')
            .insert({ course_id: resolvedCourseId, textbook_id: existingByIsbn.id });
          if (linkError) return NextResponse.json({ error: 'Failed to link textbook to course' }, { status: 500 });
        }
        return NextResponse.json({ message: 'Linked existing textbook to course by ISBN' });
      }
    }
    const { data: dup } = await supabase
      .from('textbooks')
      .select('id')
      .eq('title', title)
      .eq('author', author)
      .eq('edition', edition)
      .maybeSingle();

    if (dup) {
      const { data: existingLink } = await supabase
        .from('course_textbooks')
        .select('id')
        .eq('course_id', resolvedCourseId)
        .eq('textbook_id', dup.id)
        .maybeSingle();

      if (!existingLink) {
        const { error: linkError } = await supabase
          .from('course_textbooks')
          .insert({ course_id: resolvedCourseId, textbook_id: dup.id });
        if (linkError) return NextResponse.json({ error: 'Failed to link textbook to course' }, { status: 500 });
      }
      return NextResponse.json({ message: 'Linked existing textbook to course' });
    }
    const { data: newTextbook, error: insertError } = await supabase
      .from('textbooks')
      .insert({ title, author, edition, isbn }) 
      .select('id')
      .single();
    if (insertError || !newTextbook) {
      return NextResponse.json({ error: insertError?.message || 'Failed to insert textbook' }, { status: 500 });
    }

    const textbookId = newTextbook.id as string;
    let finalImageFile: File | null = imageFile;
    if (!finalImageFile && imageUrl) {
      const resp = await fetch(imageUrl);
      if (!resp.ok) return NextResponse.json({ error: `Failed to fetch image: ${resp.status}` }, { status: 400 });
      const blob = await resp.blob();
      const ct2 = blob.type || 'image/jpeg';
      const extFromCt = ct2.split('/')[1] || 'jpg';
      finalImageFile = new File([blob], `downloaded.${extFromCt}`, { type: ct2 });
    }

    if (finalImageFile) {
      const ext = (finalImageFile.name.split('.').pop() || '').toLowerCase();
      if (!/^(jpg|jpeg|png|webp|gif)$/i.test(ext)) {
        return NextResponse.json({ error: 'Invalid image extension.' }, { status: 400 });
      }
      const imagePath = `${textbookId}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('textbooks')
        .upload(imagePath, finalImageFile, {
          contentType: finalImageFile.type || 'image/jpeg',
          upsert: true,
        });
      if (uploadError) return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });

      const { error: updateError } = await supabase
        .from('textbooks')
        .update({ image_path: imagePath })
        .eq('id', textbookId);
      if (updateError) return NextResponse.json({ error: 'Failed to update image path' }, { status: 500 });
    }
    const { error: joinError } = await supabase
      .from('course_textbooks')
      .insert({ course_id: resolvedCourseId, textbook_id: textbookId });
    if (joinError) return NextResponse.json({ error: 'Failed to link textbook to course' }, { status: 500 });

    return NextResponse.json({ message: 'Textbook added and linked to course successfully', textbookId });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 });
  }
}
