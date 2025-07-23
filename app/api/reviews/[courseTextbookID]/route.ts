import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(_: Request, { params }: { params: { courseTextbookID: string } }) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('reviews')
    .select('id, user_id, rating, text, is_anonymous, created_at')
    .eq('course_textbook_id', params.courseTextbookID);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
