import Link from 'next/link';
import { createClient } from '@/utils/supabase/server'

export default async function Navbar(){
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return(
    <nav className="bg-gray-100 shadow-sm px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-blue-600">
            RateYourTextbooks
        </Link>
        <div className="space-x-4">
            {!user ? (
                <>
                    <Link href="/login" className="text-gray-700 hover:text-blue-600">
                        Login
                    </Link>
                    <Link href="/register" className="text-gray-700 hover:text-blue-600">
                        Register
                    </Link>
                </>
            ) : (
                <>
                    <Link href="/profile" className="text-gray-700 hover:text-blue-600">
                        Profile
                    </Link>
                    <form action="/api/logout" method="post" className="inline">
                        <button
                            type="submit"
                            className="text-gray-700 hover:text-blue-600 cursor-pointer"
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
