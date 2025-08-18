export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(
  _req: NextRequest,
  { params }: { params: { ctid: string } }
) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth?.user?.id ?? null;
  const { data: reviews, error } = await supabase
    .from('reviews')
    .select(
      `
      id,
      user_id,
      rating,
      text,
      is_anonymous,
      created_at,
      updated_at,
      users(display_name, avatar_url)
    `
    )
    .eq('course_textbook_id', params.ctid);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // fetch vote counts in one go
  const ids = reviews?.map((r) => r.id) ?? [];
  let counts: Record<string, { up: number; down: number }> = {};
  let myVotes: Record<string, boolean | null> = {};

  if (ids.length) {
    const { data: votes } = await supabase
      .from('review_votes')
      .select('review_id, is_upvote, user_id')
      .in('review_id', ids);

    for (const id of ids) counts[id] = { up: 0, down: 0 };

    (votes ?? []).forEach((v) => {
      if (v.is_upvote) counts[v.review_id].up += 1;
      else counts[v.review_id].down += 1;
      if (userId && v.user_id === userId) myVotes[v.review_id] = v.is_upvote;
    });
  }
  const enriched = (reviews ?? []).map((r: any) => {
    const c = counts[r.id] ?? { up: 0, down: 0 };
    const score = c.up - c.down;
    return {
      ...r,
      upvotes: c.up,
      downvotes: c.down,
      score,
      user_vote: myVotes[r.id] ?? null,
      is_owner: userId ? userId === r.user_id : false,
    };
  });

  enriched.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return NextResponse.json({
    reviews: enriched,
    currentUserId: userId,
  });
}
