'use client';
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function Register() {
    const router = useRouter();
    const supabase = createClient();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault();
        setSuccessMessage('');

        const { data: authData } = await supabase.auth.signUp({
            email,
            password,
        });

        setSuccessMessage("Check your email to confirm your account.");
    }

    return (
        <div className='min-h-screen flex items-center justify-center bg-gray-100 px-4'>
            <form
                onSubmit={handleRegister}
                className="bg-white shadow-md rounded-lg p-6 w-full max-w-sm space-y-4"
            >
                <h1 className="text-2xl font-bold text-center text-blue-500">Register</h1>
                <input
                    className='w-full p-2 border text-black border-gray-300 rounded'
                    type='email'
                    placeholder='Email...'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    className='w-full p-2 border text-black border-gray-300 rounded'
                    type='password'
                    placeholder='Password...'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                {successMessage && (
                    <p className="text-green-500 text-sm">{successMessage}</p>
                )}
                <button
                    type='submit'
                    className='w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors cursor-pointer'
                >
                    Register
                </button>
            </form>
        </div>
    );
}
