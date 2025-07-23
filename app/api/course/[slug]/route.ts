import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { slugify } from '@/utils/slugify';

// GET SPECIFIC COURSE
export async function GET(req: Request, { params }: { params: { slug: string } })
{
  const supabase = await createClient();

  const { data: courses, error: courseGetError } = await supabase
    .from('courses')
    .select('id, title, code');

  if (courseGetError || !courses) {
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }

  const match = courses.find((c) => slugify(c.title) === params.slug);

  if (!match) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(match);
}
