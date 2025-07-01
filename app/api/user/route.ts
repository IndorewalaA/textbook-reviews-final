export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({ email: user.email });
}

export async function PATCH(req: NextRequest) {
    const supabase = await createClient();
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    const formData = await req.formData()
    const username = formData.get('username') as string | null;
    const email = formData.get('email') as string | null;
    const password = formData.get('password') as string | null;

    if (email || password) {
        const updatePayload: { email?: string; password?: string } = {};

        if (email) updatePayload.email = email;
        if (password && password.length >= 6) updatePayload.password = password;
        const { error: updateError } = await supabase.auth.updateUser(updatePayload);
        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 400 });
        }
    }

    if (username) {
        const { 
            error: dbUpdateError 
        } = await supabase
            .from('users')
            .update({display_name: username})
            .eq('id', user.id)
    
        if (dbUpdateError) {
            return NextResponse.json({ error: dbUpdateError.message }, { status: 500 });
        }
    }

    return NextResponse.json({ message: 'User updated successfully' });
}
