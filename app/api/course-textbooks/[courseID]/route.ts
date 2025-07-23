import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { slugify } from '@/utils/slugify';

export async function GET(req: Request, { params }: { params: { courseID: string } }) {
    const supabase = await createClient();
    const { data: course_textbook_info, error: getError } = await supabase
        .from('course_textbooks')
        .select('id, textbook_id')
        .eq('course_id', params.courseID);
    if (getError) return NextResponse.json({ error: getError.message }, { status: 500 });
    return NextResponse.json(course_textbook_info);
}