import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { slugify } from '@/utils/slugify';
import { FaThumbsUp, FaThumbsDown, FaEdit, FaTrashAlt, FaUserCircle, FaStar } from 'react-icons/fa';

export default async function TextbookPage({ params }: { params: { courseTitle: string; bookTitle: string } }) {
  const supabase = await createClient();

  const courseTitleSlug = params.courseTitle;
  const bookTitleSlug = params.bookTitle;

  const courseRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/courses/${courseTitleSlug}`);
  const course = await courseRes.json();
  if (!course || course.error) return notFound();

  const joinRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/course-textbooks/${course.id}`);
  const joinList = await joinRes.json();
  if (!joinList || joinList.error) return notFound();

  const textbookIDs = joinList.map((j: any) => j.textbook_id).join(',');
  const bookRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/textbooks/many?ids=${textbookIDs}`);
  const textbooks = await bookRes.json();
  if (!textbooks || textbooks.error) return notFound();

  const textbook = textbooks.find((b: any) => slugify(b.title) === bookTitleSlug);
  if (!textbook) return notFound();

  const courseTextbook = joinList.find((j: any) => j.textbook_id === textbook.id);
  if (!courseTextbook) return notFound();

  const reviewRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/reviews/${courseTextbook.id}`);
  const reviews = await reviewRes.json();
  if (reviews.error || !reviews) return notFound();

  console.log('review sample:', reviews[0]);
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

        {/* Textbook Header + Course Info */}
        <section className="bg-white shadow-md rounded-lg p-6">
          <div className="flex items-start gap-6">
            {textbook.image_path && (
              <img
                src={`https://urfkyhsntpwpwpsmskcz.supabase.co/storage/v1/object/public/textbooks/${textbook.image_path}`}
                alt={textbook.title}
                className="w-28 h-auto rounded shadow"
              />
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{textbook.title}</h1>
              <p className="text-gray-700 mb-1">
                <span className="font-semibold">Author:</span> {textbook.author}
              </p>
              {textbook.edition && (
                <p className="text-gray-700 mb-1">
                  <span className="font-semibold">Edition:</span> {textbook.edition}
                </p>
              )}
              <p className="text-gray-700 mt-4">
                <span className="font-semibold">Associated Course:</span>{' '}
                {course.code} – {course.title}
              </p>
            </div>
          </div>
        </section>

        {/* Overall Rating */}
        <div className="mb-8">
          {reviews.length > 0 ? (
            <div className="flex items-center gap-4">
              <div className="text-2xl font-bold text-gray-800">Overall Rating: </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => {
                  const avg =
                    reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length;
                  const rounded = Math.round(avg * 2) / 2;
                  if (i + 1 <= rounded) {
                    return <FaStar key={i} size={24} className="text-yellow-500" />;
                  } else if (i + 0.5 === rounded) {
                    return (
                      <FaStar
                        key={i}
                        size={24}
                        className="text-yellow-500 opacity-50"
                      />
                    );
                  } else {
                    return <FaStar key={i} size={24} className="text-gray-300" />;
                  }
                })}
                <span className="ml-2 text-xl font-semibold text-gray-700">
                  {(
                    reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
                  ).toFixed(1)}
                  /5
                </span>
              </div>
            </div>
          ) : (
            <div className="text-lg text-gray-500 italic mb-6">
              No ratings yet to calculate an average.
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <section className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Student Reviews</h2>

          {reviews.length === 0 ? (
            <p className="text-gray-500 italic">No reviews yet. Be the first to leave one!</p>
          ) : (
            <div className="space-y-6">
              {reviews.map((review: any) => (
                <div
                  key={review.id}
                  className="bg-gray-100 rounded-lg p-5 shadow-sm hover:shadow-md transition"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {!review.is_anonymous && review.users?.avatar_url ? (
                        <img
                          src={review.users.avatar_url}
                          alt="Profile"
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <FaUserCircle size={30} className="text-gray-500" />
                      )}

                      <div className="text-sm">
                        <p className="font-semibold text-gray-800">
                          {review.is_anonymous
                            ? 'Anonymous'
                            : review.users?.display_name || 'Unknown User' }
                        </p>
                        <p className="text-gray-500 text-xs">
                          {new Date(review.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex items-center gap-1 px-3 py-1.5 rounded-md text-white bg-blue-600 hover:bg-blue-700 text-sm transition">
                        <FaEdit size={18} />
                        <span>Edit</span>
                      </button>
                      <button className="flex items-center gap-1 px-3 py-1.5 rounded-md text-white bg-red-500 hover:bg-red-600 text-sm transition">
                        <FaTrashAlt size={18} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <FaStar
                        key={i}
                        size={22}
                        className={i < review.rating ? 'text-yellow-500' : 'text-gray-300'}
                      />
                    ))}
                    <span className="ml-3 text-lg font-semibold text-gray-800">
                      {review.rating}/5
                    </span>
                  </div>
                  {/* Text */}
                  {review.text && (
                    <p className="text-gray-700 leading-relaxed mb-4">{review.text}</p>
                  )}

                  {/* Voting */}
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <button className="flex items-center gap-2 hover:text-green-600 transition">
                      <FaThumbsUp size={14} />
                      <span>Upvote</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-red-600 transition">
                      <FaThumbsDown size={14} />
                      <span>Downvote</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
