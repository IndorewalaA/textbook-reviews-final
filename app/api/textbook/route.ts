export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

export async function POST(req: NextRequest) {
    const supabase = createAdminClient();
    const formData = await req.formData();

    const courseId = formData.get('courseId') as string;
    const title = formData.get('title') as string;
    const author = formData.get('author') as string;
    const edition = (formData.get('edition') as string) || null;
    const image = formData.get('image') as File | null;

    if (!courseId || !title || !author || !image) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: existingTextbook } = await supabase
        .from('textbooks')
        .select('id')
        .eq('title', title)
        .eq('author', author)
        .eq('edition', edition)
        .maybeSingle();

    if (existingTextbook) {
        const { data: existingLink } = await supabase
            .from('course_textbooks')
            .select('id')
            .eq('course_id', courseId)
            .eq('textbook_id', existingTextbook.id)
            .maybeSingle();

        if (existingLink) {
            return NextResponse.json({ message: 'Textbook already linked to this course' });
        }

        const { error: linkError } = await supabase
            .from('course_textbooks')
            .insert({ course_id: courseId, textbook_id: existingTextbook.id });

        if (linkError) {
            return NextResponse.json({ error: 'Failed to link textbook to course' }, { status: 500 });
        }

        return NextResponse.json({ message: 'Linked existing textbook to course' });
    }

    const { data: newTextbook, error: insertError } = await supabase
        .from('textbooks')
        .insert({ title, author, edition })
        .select('id')
        .single();

    if (insertError || !newTextbook) {
        return NextResponse.json({ error: 'Failed to insert textbook' }, { status: 500 });
    }

    const textbookId = newTextbook.id;
    const ext = image.name.split('.').pop()?.toLowerCase();
    if (!ext || !/^(jpg|jpeg|png|webp|gif)$/i.test(ext)) {
        return NextResponse.json({ error: 'Invalid image extension.' }, { status: 400 });
    }
    const imagePath = `${textbookId}.${ext}`;

    const { error: uploadError } = await supabase.storage
        .from('textbooks')
        .upload(imagePath, image, {
            contentType: image.type,
            upsert: true,
        });

    if (uploadError) {
        return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
    }
    console.log(ext);
    const { error: updateError } = await supabase
        .from('textbooks')
        .update({ image_path: `${imagePath}` })
        .eq('id', textbookId);

    if (updateError) {
        return NextResponse.json({ error: 'Failed to update image path' }, { status: 500 });
    }

    const { error: joinError } = await supabase
        .from('course_textbooks')
        .insert({ course_id: courseId, textbook_id: textbookId });

    if (joinError) {
        return NextResponse.json({ error: 'Failed to link textbook to course' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Textbook added and linked to course successfully' });
}
