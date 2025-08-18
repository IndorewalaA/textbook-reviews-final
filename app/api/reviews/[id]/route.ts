export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth?.user?.id;
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const reviewId = params.id;
  const { rating, text, is_anonymous } = await req.json();
  const { data: review, error: rErr } = await supabase
    .from('reviews')
    .select('user_id')
    .eq('id', reviewId)
    .single();

  if (rErr || !review) return NextResponse.json({ error: 'Review not found' }, { status: 404 });
  if (review.user_id !== userId)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  if (rating !== undefined && (rating < 1 || rating > 5)) {
    return NextResponse.json({ error: 'rating must be 1–5' }, { status: 400 });
  }

  const { error } = await supabase
    .from('reviews')
    .update({
      ...(rating !== undefined ? { rating } : {}),
      ...(text !== undefined ? { text } : {}),
      ...(is_anonymous !== undefined ? { is_anonymous } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq('id', reviewId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth?.user?.id;
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const { data: review, error: rErr } = await supabase
    .from('reviews')
    .select('user_id')
    .eq('id', params.id)
    .single();

  if (rErr || !review) return NextResponse.json({ error: 'Review not found' }, { status: 404 });
  if (review.user_id !== userId)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { error } = await supabase.from('reviews').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
