import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import SearchBar from '@/components/SearchBar';
import { notFound } from 'next/navigation';

export const revalidate = 60;

type Row = {
  course_slug: string;
  course_code: string;
  course_title: string;
  textbook_id: string;
  textbook_title: string;
  textbook_author: string | null;
  textbook_edition: string | null;
  textbook_image_path: string | null;
  textbook_slug: string;
};

export default async function CoursePage({
  params,
}: {
  params: { courseTitle: string };
}) {
  const supabase = await createClient();

  // First: get the course itself (so we know it exists)
  const { data: courseRow, error: courseErr } = await supabase
    .from('courses')
    .select('id, code, title, slug')
    .eq('slug', params.courseTitle)
    .single();

  if (courseErr || !courseRow) return notFound();

  // Then: fetch textbooks for that course
  const { data: textbooks, error: textErr } = await supabase
    .from('course_textbook_details')
    .select(
      'textbook_id, textbook_title, textbook_author, textbook_edition, textbook_image_path, textbook_slug'
    )
    .eq('course_id', courseRow.id)
    .order('textbook_title', { ascending: true });

  if (textErr) return notFound();

  return (
    <main className="min-h-screen bg-gray-50 text-gray-800">
      {/* Hero */}
      <section className="bg-slate-900 text-white py-24 px-6 text-center shadow-md">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          {courseRow.code} – {courseRow.title}
        </h1>
        <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">
          Reviews for textbooks for this course.
        </p>
      </section>

      <SearchBar />

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pb-24">
        <Link
          href="/courses"
          className="text-blue-600 hover:underline mb-8 inline-block text-lg font-medium"
        >
          ← Back to Courses
        </Link>

        <h2 className="text-2xl font-bold mb-6 text-slate-800">Textbooks</h2>

        {!textbooks || textbooks.length === 0 ? (
          <p className="text-gray-600">No textbooks</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {textbooks.map((book) => (
              <Link
                key={book.textbook_id}
                href={`/courses/${courseRow.slug}/${book.textbook_slug}`}
                className="block bg-white p-6 rounded-xl border border-gray-200 shadow hover:shadow-lg transition text-slate-900 hover:cursor-pointer hover:ring-2 hover:ring-slate-500"
              >
                {book.textbook_image_path && (
                  <img
                    src={`https://urfkyhsntpwpwpsmskcz.supabase.co/storage/v1/object/public/textbooks/${book.textbook_image_path}`}
                    alt={book.textbook_title}
                    className="h-48 w-32 object-contain rounded-md shadow-sm mx-auto mb-4"
                  />
                )}

                <h3 className="text-lg font-semibold text-slate-800">
                  {book.textbook_title}
                </h3>
                {book.textbook_author && (
                  <p className="text-sm text-gray-600 mt-1">{book.textbook_author}</p>
                )}
                {book.textbook_edition && (
                  <p className="text-xs text-gray-500 mt-1 italic">
                    Edition: {book.textbook_edition}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
