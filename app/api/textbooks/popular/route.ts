import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// Get Top 3
export async function GET(req: NextRequest) {
    const supabase = await createClient();
    const { data: top6, error: top6Error } = await supabase
        .from('course_textbooks_with_avg')
        .select(`average_rating, review_count, textbooks (title,image_path), courses (title, code)`)
        .order('average_rating', { ascending: true })
        .limit(6);

    if (top6Error) return NextResponse.json({ error: top6Error.message }, { status: 500 });
    return NextResponse.json(top6);
}