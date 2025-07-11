import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';

export default async function Navbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isAdmin = false;

  if (user) {
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

      if (role?.name === 'admin') {
        isAdmin = true;
      }
    }
  }
  return (
    <nav className="bg-gray-50 border-b border-gray-200 shadow-sm px-6 py-3 flex justify-between items-center">
      {/* Logo */}
      <Link href="/" className="text-xl font-bold text-slate-800 hover:text-slate-900 transition">
        RateYourTextbooks
      </Link>

      {/* Navigation Links */}
      <div className="flex items-center gap-4 text-sm font-medium">
        {isAdmin && (
          <Link href="/admin" className="text-gray-700 hover:text-slate-900 transition">
            Admin
          </Link>
        )}

        <Link href="/courses" className="text-gray-700 hover:text-slate-900 transition">
          Courses
        </Link>

        {!user ? (
          <>
            <Link href="/login" className="text-gray-700 hover:text-slate-900 transition">
              Login
            </Link>
            <Link href="/register" className="text-gray-700 hover:text-slate-900 transition">
              Register
            </Link>
          </>
        ) : (
          <>
            <Link href="/profile" className="text-gray-700 hover:text-slate-900 transition">
              Profile
            </Link>
            <form action="/api/auth/logout" method="post" className="inline">
              <button
                type="submit"
                className="text-gray-700 hover:text-slate-900 transition cursor-pointer"
              >
                Logout
              </button>
            </form>
          </>
        )}
      </div>
    </nav>
  );
}
