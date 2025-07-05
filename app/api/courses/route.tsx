export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin'

export async function GET(req: NextRequest) {
    const supabase = await createClient();
    const {
        data: courseList,
        error: courseGetError
    } = await supabase
        .from('courses')
        .select('id, code, title');

    if (courseGetError) {
        return NextResponse.json( { error: 'An error occured.' }, { status: 500 });
    }
    
    return NextResponse.json( { courses: courseList}, { status: 200 });
}