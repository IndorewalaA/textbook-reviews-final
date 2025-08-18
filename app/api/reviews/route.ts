export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth?.user?.id;
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { course_textbook_id, rating, text, is_anonymous } = await req.json();

  if (!course_textbook_id || !rating) {
    return NextResponse.json({ error: 'course_textbook_id and rating required' }, { status: 400 });
  }
  if (typeof rating !== 'number' || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'rating must be 1–5' }, { status: 400 });
  }
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      user_id: userId,
      course_textbook_id,
      rating,
      text: text ?? null,
      is_anonymous: !!is_anonymous,
    })
    .select('id')
    .single();

  if (error) {
    const conflict = (error as any)?.code === '23505';
    return NextResponse.json(
      { error: conflict ? 'You already reviewed this textbook' : error.message },
      { status: conflict ? 409 : 500 }
    );
  }

  return NextResponse.json({ id: data.id });
}
