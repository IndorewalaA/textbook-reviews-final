import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { FaThumbsUp, FaThumbsDown, FaEdit, FaTrashAlt, FaUserCircle, FaStar } from 'react-icons/fa';

export const revalidate = 60;

export default async function TextbookPage({
  params,
}: {
  params: { courseTitle: string; bookTitle: string };
}) {
  const supabase = await createClient();

  const { data: authData } = await supabase.auth.getUser();
  const currentUserId = authData?.user?.id ?? null;

  const { data: rows, error: detailsError } = await supabase
    .from('course_textbook_details')
    .select('*')
    .eq('course_slug', params.courseTitle)
    .eq('textbook_slug', params.bookTitle)
    .limit(1);

  if (detailsError || !rows || rows.length === 0) return notFound();
  const r = rows[0] as any;

  const { data: reviewsRaw } = await supabase
    .from('reviews')
    .select(
      'id, user_id, rating, text, is_anonymous, created_at, users(display_name, avatar_url)'
    )
    .eq('course_textbook_id', r.course_textbook_id)
    .order('created_at', { ascending: false });

  const allReviews = (reviewsRaw ?? []) as any[];

  const yourReview = currentUserId
    ? allReviews.find((rev) => rev.user_id === currentUserId) || null
    : null;

  const otherReviews = yourReview
    ? allReviews.filter((rev) => rev.id !== yourReview.id)
    : allReviews;

  const avg =
    allReviews.length > 0
      ? allReviews.reduce((s, x) => s + (x.rating ?? 0), 0) / allReviews.length
      : 0;
  const roundedHalf = Math.round(avg * 2) / 2;

  const ReviewCard = ({
    review,
    forceOwner = false,
  }: {
    review: any;
    forceOwner?: boolean;
  }) => {
    const isOwner = forceOwner || (currentUserId && review.user_id === currentUserId);
    return (
      <div className="bg-gray-100 rounded-lg p-5 shadow-sm hover:shadow-md transition">
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
                {isOwner
                  ? review.is_anonymous
                    ? 'You (anonymous)'
                    : 'You'
                  : review.is_anonymous
                  ? 'Anonymous'
                  : review.users?.display_name || 'Unknown User'}
              </p>
              <p className="text-gray-500 text-xs">
                {new Date(review.created_at).toLocaleString()}
              </p>
            </div>
          </div>
          {isOwner && (
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
          )}
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
        {/*Voting*/}
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
    );
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        {/* Back link */}
        <Link
          href={`/courses/${r.course_slug}`}
          className="text-lg text-blue-600 hover:underline"
        >
          ← Back to {r.course_code}
        </Link>

        {/* Textbook Header */}
        <section className="bg-white shadow-md rounded-lg p-6">
          <div className="flex items-start gap-6">
            {r.textbook_image_path && (
              <img
                src={`https://urfkyhsntpwpwpsmskcz.supabase.co/storage/v1/object/public/textbooks/${r.textbook_image_path}`}
                alt={r.textbook_title}
                className="w-28 h-auto rounded shadow"
              />
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{r.textbook_title}</h1>
              {r.textbook_author && (
                <p className="text-gray-700 mb-1">
                  <span className="font-semibold">Author:</span> {r.textbook_author}
                </p>
              )}
              {r.textbook_edition && (
                <p className="text-gray-700 mb-1">
                  <span className="font-semibold">Edition:</span> {r.textbook_edition}
                </p>
              )}
              {r.textbook_isbn && (
                <p className="text-gray-700 mb-1">
                  <span className="font-semibold">ISBN:</span> {r.textbook_isbn}
                </p>
              )}
              <p className="text-gray-700 mt-4">
                <span className="font-semibold">Associated Course:</span>{' '}
                {r.course_code} – {r.course_title}
              </p>
            </div>
          </div>
        </section>

        {/* Overall Rating */}
        <div className="mb-8">
          {allReviews.length > 0 ? (
            <div className="flex items-center gap-4">
              <div className="text-2xl font-bold text-gray-800">Overall Rating: </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => {
                  if (i + 1 <= roundedHalf) {
                    return <FaStar key={i} size={24} className="text-yellow-500" />;
                  } else if (i + 0.5 === roundedHalf) {
                    return <FaStar key={i} size={24} className="text-yellow-500 opacity-50" />;
                  } else {
                    return <FaStar key={i} size={24} className="text-gray-300" />;
                  }
                })}
                <span className="ml-2 text-xl font-semibold text-gray-700">
                  {avg.toFixed(1)}/5
                </span>
              </div>
            </div>
          ) : (
            <div className="text-lg text-gray-500 italic mb-6">
              No ratings yet to calculate an average.
            </div>
          )}
        </div>
        {yourReview && (
          <section className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Your Review</h2>
            <ReviewCard review={yourReview} forceOwner />
          </section>
        )}
        {/* Student Reviews*/}
        <section className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Student Reviews</h2>

          {otherReviews.length === 0 ? (
            <p className="text-gray-500 italic">
              {yourReview ? 'No other reviews yet.' : 'No reviews yet. Be the first to leave one!'}
            </p>
          ) : (
            <div className="space-y-6">
              {otherReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
