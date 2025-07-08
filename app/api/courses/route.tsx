export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: courseList,
    error: courseGetError
  } = await supabase
    .from('courses')
    .select('id, code, title');

  if (courseGetError || !courseList) {
    return NextResponse.json({ error: 'Failed to fetch courses.' }, { status: 500 });
  }

  const {
    data: courseTextbooks,
    error: textbooksError
  } = await supabase
    .from('course_textbooks')
    .select('course_id');

  if (textbooksError || !courseTextbooks) {
    return NextResponse.json({ error: 'Failed to fetch textbook data.' }, { status: 500 });
  }

  const textbookCounts: Record<string, number> = {};
  for (const entry of courseTextbooks) {
    textbookCounts[entry.course_id] = (textbookCounts[entry.course_id] || 0) + 1;
  }

  const enrichedCourses = courseList.map((course) => ({
    ...course,
    textbookCount: textbookCounts[course.id] || 0,
  }));

  return NextResponse.json({ courses: enrichedCourses }, { status: 200 });
}
