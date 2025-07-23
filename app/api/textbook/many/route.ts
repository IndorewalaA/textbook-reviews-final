import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// Get Textbooks with Particular ID
export async function GET(req: NextRequest) {
  const ids = req.nextUrl.searchParams.get('ids')?.split(',') || [];
  if (!ids.length) return NextResponse.json([], { status: 200 });

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('textbooks')
    .select('id, title, author, edition, image_path')
    .in('id', ids);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
