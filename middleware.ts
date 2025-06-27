import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from './utils/supabase/middleware'

export async function middleware(request: NextRequest) {
    const { supabase, response } = createClient(request)
    const { data : { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.redirect(new URL('/login', request.url))
    }
    return response
}

export const config = {
matcher: ['/profile/:path*'],
}