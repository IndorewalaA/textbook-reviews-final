import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(_: Request, { params }: { params: { courseTextbookID: string } }) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('reviews')
    .select('id, user_id, rating, text, is_anonymous, created_at, users(display_name, avatar_url)')
    .eq('course_textbook_id', params.courseTextbookID);

  console.log("DATA:", data);
  console.log("ERROR:", error);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data || data.length === 0) return NextResponse.json({ error: 'No reviews found' }, { status: 404 });

  return NextResponse.json(data);
}

