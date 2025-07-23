export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/server';

// Add Course
export async function POST(req: NextRequest) {
    const supabase = createAdminClient();
    const { code, title } = await req.json();
    if (!code || !title) {
        return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    const { error } = await supabase
        .from('courses')
        .insert({code, title});
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ message: 'Course added successfully' });
}