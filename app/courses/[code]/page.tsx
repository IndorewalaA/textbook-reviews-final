export const runtime = 'nodejs';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';


export default async function CoursePage({ params }: { params: { code: string } }) {
  const supabase = await createClient();

  const { data: course, error } = await supabase
    .from('courses')
    .select('*')
    .eq('code', params.code)
    .single();
  if (error || !course) return notFound();
  return (
    <div className="min-h-screen bg-gray-100 text-gray-800"></div>
  )
}
