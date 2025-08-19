export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient(); 
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('query') || '').trim();

    let query = supabase
      .from('courses')
      .select('id, code, title, slug')
      .order('code', { ascending: true });

    if (q) {
      query = query.or(`code.ilike.%${q}%,title.ilike.%${q}%,slug.ilike.%${q}%`);
    }

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 });
  }
}

// POST
export async function POST(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const body = await req.json().catch(() => ({}));
    const code = (body.code || '').toString().trim();
    const title = (body.title || '').toString().trim();

    if (!code || !title) {
      return NextResponse.json({ error: 'Missing fields: code, title' }, { status: 400 });
    }
    const base = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    let slug = `${code.toLowerCase()}-${base || 'course'}`;
    for (let i = 0; i < 5; i++) {
      const { data: hit, error } = await supabase
        .from('courses')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      if (!hit) break;
      slug = `${code.toLowerCase()}-${base || 'course'}-${i + 2}`;
    }

    const { error } = await supabase.from('courses').insert({ code, title, slug });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ message: 'Course added successfully', slug });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 });
  }
}
