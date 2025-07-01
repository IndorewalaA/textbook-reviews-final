export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server'

export async function POST(req: NextRequest) {
    console.log('START')
    const supabase = await createClient()
    const {
        data: { user },
        error: authError
    } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'Not authorized.'}, { status: 401 })
    }

    const formData = await req.formData();
    const file = formData.get('image');
    if (!file) {
        return NextResponse.json({ error: 'No image provided.'}, { status: 400})
    }

    const filePath = `profile-pictures/${user.id}.png`
    const { error: uploadError } = await supabase.storage
    .from('profile-pictures')
    .upload(filePath, file, {
        upsert: true
    })

    if (uploadError) {
        console.error('Upload error:', uploadError);
        return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: urlData } = supabase.storage
    .from('profile-pictures')
    .getPublicUrl(filePath)

    const { error: dbUploadError } = await supabase
    .from('users')
    .update({ avatar_url: urlData.publicUrl })
    .eq('id', user.id)

    if (dbUploadError) {
        return NextResponse.json({ error: dbUploadError.message}, { status: 500 })
    }

    return NextResponse.json({ url: urlData.publicUrl })
}