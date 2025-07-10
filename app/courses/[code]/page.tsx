import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import SearchBar from '@/app/components/SearchBar';
import { notFound } from 'next/navigation';

export default async function CoursePage({ params }: { params: { code: string } }) {
  const supabase = await createClient();

  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('id, code, title')
    .eq('code', params.code.toUpperCase())
    .single();

  if (courseError || !course) return notFound();

  const { data: joinList, error: joinListError } = await supabase
    .from('course_textbooks')
    .select('textbook_id')
    .eq('course_id', course.id);

  if (joinListError || !joinList) return notFound();

  const textbookIDs = joinList.map((entry) => entry.textbook_id);

  const { data: textbooks, error: textbookError } = await supabase
    .from('textbooks')
    .select('id, title, author, edition, image_path')
    .in('id', textbookIDs);

  if (textbookError) return notFound();

  return (
    <main className="min-h-screen bg-gray-50 text-gray-800">
      {/* Hero */}
      <section className="bg-slate-900 text-white py-24 px-6 text-center shadow-md">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          {course.code} – {course.title}
        </h1>
        <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">
          Reviews for textbooks for this course.
        </p>
      </section>

      {/* Search */}
      <SearchBar />

      {/* Textbooks Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pb-24">
        <Link
          href="/courses"
          className="text-blue-600 hover:underline mb-8 inline-block text-lg font-medium"
        >
          ← Back to Courses
        </Link>

        <h2 className="text-2xl font-bold mb-6 text-slate-800">Textbooks</h2>

        {textbooks.length === 0 ? (
          <p className="text-gray-600">No textbooks linked to this course.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {textbooks.map((book) => (
              <div
                key={book.id}
                className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl border border-gray-200 transition-all flex flex-col items-center text-center"
              >
                {book.image_path && (
                  <img
                    src={`https://urfkyhsntpwpwpsmskcz.supabase.co/storage/v1/object/public/textbooks//${book.image_path}`}
                    alt={book.title}
                    className="h-48 w-32 object-contain rounded-md shadow-sm mx-auto mb-4"
                  />
                )}

                <h3 className="text-lg font-semibold text-slate-800">{book.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{book.author}</p>
                {book.edition && (
                  <p className="text-xs text-gray-500 mt-1 italic">Edition: {book.edition}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
