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
    .eq('code', params.code.toUpperCase())
    .single();

  if (error || !course) return notFound();

  // Placeholder textbooks
  const textbooks = [
    {
      id: 1,
      title: 'Introduction to Algorithms',
      authors: 'Thomas H. Cormen et al.',
      edition: '4th Edition',
      rating: 4.5,
      reviewCount: 32,
      description: 'A comprehensive guide to algorithms, widely used in computer science courses.',
      imageUrl: null, // placeholder until you fetch real image URLs
    },
    {
      id: 2,
      title: 'Discrete Mathematics and Its Applications',
      authors: 'Kenneth H. Rosen',
      edition: '8th Edition',
      rating: 4.1,
      reviewCount: 19,
      description: 'A foundational text in discrete math with a practical, student-friendly approach.',
      imageUrl: null,
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50 text-gray-800">
      {/* Hero */}
      <section className="bg-slate-900 text-white py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          {course.code.toUpperCase()} – {course.title}
        </h1>
        <p className="text-lg text-slate-300 max-w-2xl mx-auto">
          Below are textbooks used or recommended for this course by UF students.
        </p>
      </section>

      {/* Textbooks Section */}
      <section className="max-w-6xl mx-auto px-4 mt-20 pb-24">
        <h2 className="text-2xl font-bold mb-8 text-center sm:text-left text-slate-900">
          Textbooks
        </h2>

        {textbooks.length === 0 ? (
          <p className="text-gray-500 text-center text-lg">No textbooks available for this course yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {textbooks.map((book) => (
              <div
                key={book.id}
                className="bg-white p-4 rounded-xl border border-gray-200 shadow hover:shadow-lg transition flex gap-4"
              >
                {/* Book Image */}
                <div className="w-28 h-36 bg-gray-200 rounded-md flex-shrink-0 overflow-hidden">
                  {book.imageUrl ? (
                    <img
                      src={book.imageUrl}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">
                      No Image
                    </div>
                  )}
                </div>

                {/* Book Info */}
                <div className="flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-800">{book.title}</h3>
                    <p className="text-sm text-gray-600">by {book.authors}</p>
                    <p className="text-sm text-gray-500 mb-2">Edition: {book.edition}</p>
                    <p className="text-gray-700 mb-3 text-sm">{book.description}</p>
                  </div>
                  <div className="text-sm text-gray-700 font-medium">
                    Rating: {book.rating} / 5 ({book.reviewCount} review{book.reviewCount !== 1 ? 's' : ''})
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
