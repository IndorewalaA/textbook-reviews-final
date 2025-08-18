import ReviewsSection from './ReviewsSection';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { FaStar } from 'react-icons/fa';

export const revalidate = 60;

export default async function TextbookPage({
  params,
  searchParams,
}: {
  params: { courseTitle: string; bookTitle: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const supabase = await createClient();

  const { data: authData } = await supabase.auth.getUser();
  const currentUserId = authData?.user?.id ?? null;

  let { data: rows, error: detailsError } = await supabase
    .from('course_textbook_details')
    .select('*')
    .eq('course_slug', params.courseTitle)
    .eq('textbook_slug', params.bookTitle)
    .limit(1);

  if ((!rows || rows.length === 0) && searchParams?.ctid && typeof searchParams.ctid === 'string') {
    const { data: byId, error: byIdErr } = await supabase
      .from('course_textbook_details')
      .select('*')
      .eq('course_textbook_id', searchParams.ctid)
      .limit(1);

    if (byIdErr) return notFound();
    rows = byId ?? [];
    detailsError = null;
  }

  if (detailsError || !rows || rows.length === 0) return notFound();
  const r = rows[0] as any;
  const { data: ratingsRaw } = await supabase
    .from('reviews')
    .select('id, rating')
    .eq('course_textbook_id', r.course_textbook_id);

  const ratings = (ratingsRaw ?? []) as { id: string; rating: number }[];
  const avg =
    ratings.length > 0
      ? ratings.reduce((s, x) => s + (x.rating ?? 0), 0) / ratings.length
      : 0;
  const roundedHalf = Math.round(avg * 2) / 2;

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
          {ratings.length > 0 ? (
            <div className="flex items-center gap-4">
              <div className="text-2xl font-bold text-gray-800">Overall Rating:</div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => {
                  if (i + 1 <= roundedHalf) {
                    return <FaStar key={i} size={24} className="text-yellow-500" />;
                  } else if (i + 0.5 === roundedHalf) {
                    return (
                      <FaStar key={i} size={24} className="text-yellow-500 opacity-50" />
                    );
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
        <ReviewsSection
          courseTextbookId={r.course_textbook_id}
          currentUserId={currentUserId}
        />
      </div>
    </main>
  );
}
