export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(req: NextRequest) {
  const supabase = await createClient();

  const courseID = req.nextUrl.searchParams.get('course_id');
  if (!courseID) {
    return NextResponse.json({ error: 'Missing course_id' }, { status: 400 });
  }

  const { data: textbookList, error: textbookGetError } = await supabase
    .from('course_textbooks')
    .select(`
      textbook_id,
      textbook: textbook_id (
        id,
        title,
        author,
        edition,
        image_path
      )
    `)
    .eq('course_id', courseID);

  if (textbookGetError || !textbookList) {
    console.error('Supabase error:', textbookGetError);
    return NextResponse.json({ error: 'Failed to fetch textbooks.' }, { status: 500 });
  }

  const textbooks = textbookList
    .map((entry: { textbook: any }) => {
      const book = entry.textbook;
      if (!book) return null;

      const imageUrl = book.image_path
        ? supabase.storage.from('textbooks').getPublicUrl(book.image_path).data.publicUrl
        : null;

      return {
        id: book.id,
        title: book.title,
        author: book.author,
        edition: book.edition,
        image_url: imageUrl,
      };
    })
    .filter(Boolean);

  return NextResponse.json({ textbooks });
}
