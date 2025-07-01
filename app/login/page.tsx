'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function Login() {
    const router = useRouter();
    const supabase = createClient();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    async function handleLogin(e: React.FormEvent) {
        // Prevent from refreshing the page
        e.preventDefault();
        setError('');
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) {
            setError(error.message);
        } else {
            // Redirect to the home page after successful login
            window.location.href = '/';
        }
    }
    return (
        <div className='min-h-screen flex items-center justify-center bg-gray-100 px-4'>
            <form
                onSubmit={handleLogin}
                className="bg-white shadow-md rounded-lg p-6 w-full max-w-sm space-y-4"
            >
                <h1 className="text-2xl font-bold text-center text-blue-500">Login</h1>
                <input
                    className='w-full p-2 border border-gray-400 text-black rounded'
                    type='email'
                    placeholder='Email...'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    className='w-full p-2 border text-black border-gray-400 rounded'
                    type='password'
                    placeholder='Password...'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button
                    type='submit'
                    className='w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors cursor-pointer shadow-md'
                >
                    Login
                </button>
            </form>
        </div>
    );
}