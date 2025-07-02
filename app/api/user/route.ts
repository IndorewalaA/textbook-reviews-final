export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin'

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
        data: { user },
        error: error,
    } = await supabase.auth.getUser();

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

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  console.log('User:', user);
  console.log('Auth Error:', authError);

  if (authError || !user) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const supabaseAdmin = createAdminClient();

  // Optional: log ID
  console.log('Deleting user ID:', user.id);

  try {
    const deletions = [
      supabase.from('users').delete().eq('id', user.id),
      supabase.from('reviews').delete().eq('user_id', user.id),
      supabase.from('review_votes').delete().eq('user_id', user.id),
      supabase.from('flags').delete().eq('user_id', user.id),
    ];

    for (const deletion of deletions) {
      const { error } = await deletion;
      if (error) {
        console.error('DB delete error:', error);
        return NextResponse.json({ error: 'Failed to delete user data' }, { status: 500 });
      }
    }

    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
    if (deleteError) {
      console.error('Admin delete error:', deleteError);
      return NextResponse.json({ error: 'Account deletion failed' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error('Unhandled error in DELETE route:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
