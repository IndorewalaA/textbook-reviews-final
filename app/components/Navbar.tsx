'use client';

import Link from 'next/link';

export default function Navbar(){
    return(
    <nav className="bg-gray-100 shadow-sm px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-blue-600">
            RateYourTextbooks
        </Link>
        <div className="space-x-4">
            <Link href="/login" className="text-gray-700 hover:text-blue-600">
                Login
            </Link>
            <Link href="/register" className="text-gray-700 hover:text-blue-600">
                Register
            </Link>
            <Link href="/profile" className="text-gray-700 hover:text-blue-600">
                Profile
            </Link>
        </div>
    </nav>
    );
}
