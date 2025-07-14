export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get('image') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'No image provided.' }, { status: 400 });
  }

  const ext = file.name.split('.').pop()?.toLowerCase();
  if (!ext || !/^(jpg|jpeg|png|webp|gif)$/i.test(ext)) {
    return NextResponse.json({ error: 'Invalid image extension.' }, { status: 400 });
  }

  const storagePath = `${user.id}`;
  const { error: uploadError } = await supabase.storage
    .from('profile-pictures')
    .upload(storagePath, file, {
      upsert: true,
      contentType: file.type,
    });

  if (uploadError) {
    console.error('Upload error:', uploadError);
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const avatarUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profile-pictures/${storagePath}`;

  const { error: dbError } = await supabase
    .from('users')
    .update({ avatar_url: avatarUrl })
    .eq('id', user.id);

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ url: avatarUrl });
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('users')
    .select('avatar_url')
    .eq('id', user.id)
    .single();

  if (error || !data?.avatar_url) {
    return NextResponse.json({ url: null });
  }

  return NextResponse.json({ url: data.avatar_url });
}
