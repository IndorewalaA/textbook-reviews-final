export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

type Row = {
  course_textbook_id: string;
  textbook_title: string;
  textbook_image_path: string | null;
  textbook_slug: string;
  course_title: string;
  course_code: string;
  course_slug: string;
  average_rating: number | null;
  review_count: number | null;
};

export async function GET(_: NextRequest) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('course_textbook_details')
    .select(
      `
        course_textbook_id,
        textbook_title,
        textbook_image_path,
        textbook_slug,
        course_title,
        course_code,
        course_slug,
        average_rating,
        review_count
      `
    )
    .order('average_rating', { ascending: false })
    .order('review_count', { ascending: false })
    .limit(6);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const mapped = (data as Row[]).map((r) => ({
    id: r.course_textbook_id,
    average_rating: r.average_rating ?? 0,
    review_count: r.review_count ?? 0,
    textbooks: {
      title: r.textbook_title,
      image_path: r.textbook_image_path,
      slug: r.textbook_slug,
    },
    courses: {
      title: r.course_title,
      code: r.course_code,
      slug: r.course_slug,
    },
  }));

  return NextResponse.json(mapped, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  });
}
