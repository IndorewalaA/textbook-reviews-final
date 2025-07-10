import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function TextbookPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();

  // Get textbook
  const { data: textbook, error: textbookError } = await supabase
    .from('textbooks')
    .select('id, title, author, edition, image_path')
    .eq('id', params.id)
    .single();

  if (textbookError || !textbook) return notFound();

  // Get course_textbook join
  const { data: joinList, error: joinListError } = await supabase
    .from('course_textbooks')
    .select('id, course_id')
    .eq('textbook_id', textbook.id)
    .maybeSingle();

  if (joinListError || !joinList) return notFound();

  // Get course
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('id, code, title')
    .eq('id', joinList.course_id)
    .single();

  if (courseError || !course) return notFound();

  // Get reviews
  const { data: reviews, error: reviewsError } = await supabase
    .from('reviews')
    .select('id, user_id, rating, text, is_anonymous, created_at')
    .eq('course_textbook_id', joinList.id);

  if (reviewsError) return notFound();

  return (
    <main className="min-h-screen bg-gray-50 text-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        {/* Back link */}
        <Link href={`/courses/${course.code}`} className="text-lg text-blue-600 hover:underline">
          ← Back to {course.code}
        </Link>

        {/* Textbook Header */}
        <section className="bg-white shadow-md rounded-lg p-6">
          <div className="flex items-start gap-6">
            {textbook.image_path && (
              <img
                src={`https://urfkyhsntpwpwpsmskcz.supabase.co/storage/v1/object/public/textbooks//${textbook.image_path}`}
                alt={textbook.title}
                className="w-28 h-auto rounded shadow"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold mb-2">{textbook.title}</h1>
              <p className="text-gray-700 mb-1">
                <span className="font-semibold">Author:</span> {textbook.author}
              </p>
              {textbook.edition && (
                <p className="text-gray-700 mb-1">
                  <span className="font-semibold">Edition:</span> {textbook.edition}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Course Info */}
        <section className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">Associated Course</h2>
          <p className="text-gray-700">
            {course.code} – {course.title}
          </p>
        </section>

        {/* Reviews Section */}
        <section className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Student Reviews</h2>

          {reviews.length === 0 ? (
            <p className="text-gray-600 italic">No reviews yet.</p>
          ) : (
            <ul className="space-y-4">
              {reviews.map((review) => (
                <li key={review.id} className="border-t pt-4">
                  <p className="text-sm text-gray-600 mb-1">
                    {review.is_anonymous
                      ? 'Anonymous'
                      : `User ID: ${review.user_id}`}{' '}
                    – {new Date(review.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-yellow-600 font-semibold">
                    Rating: {review.rating}/5
                  </p>
                  {review.text && <p className="mt-2">{review.text}</p>}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
