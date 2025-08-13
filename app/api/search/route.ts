
export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const qRaw = req.nextUrl.searchParams.get('q') ?? '';
  const q = qRaw.trim();

  if (!q) return NextResponse.json([], { status: 200 });
  const qIsbnish = q.replace(/[^0-9xX\- ]/g, '');
  const orFilters = [
    `textbook_title.ilike.%${q}%`,
    `textbook_author.ilike.%${q}%`,
    `course_title.ilike.%${q}%`,
    `course_code.ilike.%${q}%`,
    `textbook_isbn.ilike.%${qIsbnish}%`,
  ].join(',');

  const { data, error } = await supabase
    .from('course_textbooks_with_avg_flat')
    .select(`
      course_textbook_id,
      course_id,
      textbook_id,
      textbook_title,
      textbook_author,
      textbook_edition,
      textbook_image_path,
      textbook_isbn,
      course_code,
      course_title,
      average_rating,
      review_count
    `)
    .or(orFilters)
    .order('average_rating', { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data ?? []);
}
