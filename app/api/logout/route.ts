import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server'

export async function POST(req: NextRequest) {
    const supabase = await createClient()
    await supabase.auth.signOut()
    return NextResponse.redirect(new URL('/', req.url));
}