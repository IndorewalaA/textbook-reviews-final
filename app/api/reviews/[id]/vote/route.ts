export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

async function getCounts(supabase: any, reviewId: string) {
  const [{ count: upvotes }, { count: downvotes }] = await Promise.all([
    supabase
      .from('review_votes')
      .select('*', { count: 'exact', head: true })
      .eq('review_id', reviewId)
      .eq('is_upvote', true),
    supabase
      .from('review_votes')
      .select('*', { count: 'exact', head: true })
      .eq('review_id', reviewId)
      .eq('is_upvote', false),
  ]);
  return { upvotes: upvotes ?? 0, downvotes: downvotes ?? 0 };
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }   // ✅ Next 15 expects a Promise here
) {
  try {
    const { id: reviewId } = await params;           // ✅ await params

    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = (await req.json().catch(() => ({}))) as { is_upvote?: boolean };
    const is_upvote = body?.is_upvote;
    if (typeof is_upvote !== 'boolean') {
      return NextResponse.json({ error: 'is_upvote must be boolean' }, { status: 400 });
    }

    const { data: existing, error: exErr } = await supabase
      .from('review_votes')
      .select('id, is_upvote')
      .eq('review_id', reviewId)
      .eq('user_id', userId)
      .maybeSingle();

    if (exErr) {
      return NextResponse.json({ error: exErr.message }, { status: 500 });
    }

    if (!existing) {
      const { error } = await supabase
        .from('review_votes')
        .insert({ review_id: reviewId, user_id: userId, is_upvote });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    } else if (existing.is_upvote === is_upvote) {
      // toggle off
      const { error } = await supabase.from('review_votes').delete().eq('id', existing.id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      // switch vote
      const { error } = await supabase
        .from('review_votes')
        .update({ is_upvote })
        .eq('id', existing.id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { upvotes, downvotes } = await getCounts(supabase, reviewId);

    let user_vote: boolean | null;
    if (!existing) user_vote = is_upvote;
    else if (existing.is_upvote === is_upvote) user_vote = null; // toggled off
    else user_vote = is_upvote; // switched

    return NextResponse.json({ upvotes, downvotes, user_vote }, { status: 200 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unexpected error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
