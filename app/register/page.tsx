'use client';
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function Register() {
    const router = useRouter();
    const supabase = createClient();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
        });
        if (signUpError) {
            setError(signUpError.message);
            return;
        } 
        let userId = authData?.user?.id;
        if (!userId) {
            const {
                data: { session }
            } = await supabase.auth.getSession();
            userId = session?.user?.id;
            setError('User not logged in yet.');
        }
        if (!userId) {
            setError('User was not properly created.');
            return;
        }
        const { error: insertError } = await supabase.from('users').insert({
            id: userId,
            role_id: '6231d214-81e8-4429-8b43-a4430b58851c', // student role
            display_name: email.split('@')[0],
        });
        if (insertError) {
            setError(insertError.message);
            return;
        }
        router.push('/');
        
    }
    return (
        <div className='min-h-screen flex items-center justify-center bg-gray-100 px-4'>
            <form
                onSubmit={handleRegister}
                className="bg-white shadow-md rounded-lg p-6 w-full max-w-sm space-y-4"
            >
                <h1 className="text-2xl font-bold text-center text-blue-500">Register</h1>
                <input
                    className='w-full p-2 border border-gray-300 rounded'
                    type='email'
                    placeholder='Email...'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    className='w-full p-2 border border-gray-300 rounded'
                    type='password'
                    placeholder='Password...'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button
                    type='submit'
                    className='w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors'
                >
                    Register
                </button>
            </form>
        </div>
    )
}