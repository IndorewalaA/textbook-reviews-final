import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export default async function CoursePage({
  params,
}: {
  params: { code: string };
}) {
  const supabase = await createClient();

  const { data: course, error } = await supabase
    .from('courses')
    .select('*')
    .eq('code', params.code.toUpperCase()) // match DB
    .single();

  if (error || !course) return notFound();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-4xl font-extrabold text-blue-700">{course.name}</h1>
          <p className="text-md text-gray-600 mt-1">Course Code: {course.code}</p>
        </header>

        {/* Main Content Area */}
        <main className="bg-white shadow rounded-lg p-6 space-y-4">
          <p className="text-gray-700">
            {/* Placeholder content */}
            This is where more information about the course would go — such as course description,
            professor details, related textbooks, student reviews, etc.
          </p>
        </main>
      </div>
    </div>
  );
}
