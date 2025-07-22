import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { slugify } from '@/utils/slugify';

export default async function TextbookPage({
  params,
}: {
  params: { courseTitle: string; bookTitle: string };
}) {
  const supabase = await createClient();

  // Extract slug params safely
  const courseTitleSlug = params.courseTitle;
  const bookTitleSlug = params.bookTitle;

  // Fetch all courses
  const { data: courseList, error: courseError } = await supabase
    .from('courses')
    .select('id, code, title');

  if (courseError || !courseList) return notFound();

  // Match course by slug
  const course = courseList.find(
    (c) => slugify(c.title) === courseTitleSlug
  );
  if (!course) return notFound();

  // Fetch all course-textbook associations
  const { data: joinList, error: joinListError } = await supabase
    .from('course_textbooks')
    .select('id, textbook_id')
    .eq('course_id', course.id);

  if (joinListError || !joinList) return notFound();

  const textbookIDs = joinList.map((j) => j.textbook_id);

  // Fetch textbook details
  const { data: textbooks, error: bookError } = await supabase
    .from('textbooks')
    .select('id, title, author, edition, image_path')
    .in('id', textbookIDs);

  if (bookError || !textbooks) return notFound();

  const textbook = textbooks.find(
    (b) => slugify(b.title) === bookTitleSlug
  );
  if (!textbook) return notFound();

  const courseTextbook = joinList.find((j) => j.textbook_id === textbook.id);
  if (!courseTextbook) return notFound();

  // Fetch reviews
  const { data: reviews, error: reviewsError } = await supabase
    .from('reviews')
    .select('id, user_id, rating, text, is_anonymous, created_at')
    .eq('course_textbook_id', courseTextbook.id);

  if (reviewsError || !reviews) return notFound();

  return (
    <main className="min-h-screen bg-gray-50 text-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        {/* Back link */}
        <Link
          href={`/courses/${slugify(course.title)}`}
          className="text-lg text-blue-600 hover:underline"
        >
          ← Back to {course.code}
        </Link>

        {/* Textbook Header */}
        <section className="bg-white shadow-md rounded-lg p-6">
          <div className="flex items-start gap-6">
            {textbook.image_path && (
              <img
                src={`https://urfkyhsntpwpwpsmskcz.supabase.co/storage/v1/object/public/textbooks/${textbook.image_path}`}
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
