import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from './utils/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname !== pathname.toLowerCase()) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.toLowerCase();
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith('/profile')) {
    const { supabase, response } = createClient(request);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return response;
  }

  if (pathname.startsWith('/admin')) {
    const { supabase, response } = createClient(request);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    else {
      const { data: userRole, error: roleError } = await supabase
        .from('users')
        .select('role_id')
        .eq('id', user.id)
        .single();

      if (userRole?.role_id) {
        const { data: role, error: roleGetError } = await supabase
          .from('roles')
          .select('name')
          .eq('id', userRole.role_id)
          .single();

        if (role?.name !== 'admin') {
          return NextResponse.redirect(new URL('/', request.url));
        }
      }
    }
    return response;
  }
return NextResponse.next();
}

export const config = {
  matcher: ['/:path*'],
};
