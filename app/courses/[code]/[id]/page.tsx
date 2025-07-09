import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import Image from 'next/image';

export default async function TextbookPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const { data: textbook, error } = await supabase
    .from('textbooks')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !textbook) return notFound();

  const reviews = [
    {
      id: 1,
      user: 'John Doe',
      rating: 5,
      comment: 'Excellent explanations and clear examples.',
      helpful: 12,
      unhelpful: 1,
    },
    {
      id: 2,
      user: 'Jane Smith',
      rating: 3,
      comment: 'Useful but hard to follow in some chapters.',
      helpful: 4,
      unhelpful: 2,
    },
  ];

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 'No reviews yet';

  return (
    <main className="min-h-screen bg-gray-50 text-gray-800 px-4 py-16">
      {/* Textbook Card */}
      <section className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg p-8 border space-y-6">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Book Image */}
          <div className="w-full md:w-48 h-64 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
            {textbook.image_url ? (
              <Image
                src={textbook.image_url}
                alt={textbook.title}
                width={192}
                height={256}
                className="object-cover"
              />
            ) : (
              <span className="text-gray-500 text-sm">No Image</span>
            )}
          </div>

          {/* Book Info */}
          <div className="flex-1 space-y-3">
            <h1 className="text-3xl font-extrabold text-slate-900">{textbook.title}</h1>
            <p className="text-lg text-gray-700">{textbook.author}</p>
            {textbook.edition && (
              <p className="text-sm text-gray-500">{textbook.edition}</p>
            )}
            {textbook.description && (
              <p className="text-sm text-gray-700">{textbook.description}</p>
            )}
            <div className="text-blue-600 font-semibold text-lg">
              Average Rating: {averageRating} / 5
            </div>
            <button className="mt-4 bg-blue-600 text-white font-medium px-4 py-2 rounded hover:bg-blue-700 transition">
              + Add Review
            </button>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="max-w-5xl mx-auto mt-16 space-y-6">
        <h2 className="text-2xl font-bold text-slate-900">Student Reviews</h2>

        {reviews.length === 0 ? (
          <p className="text-gray-500 text-sm">No reviews yet. Be the first to add one!</p>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white border rounded-lg shadow-sm p-5 space-y-2"
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-800">{review.user}</span>
                  <span className="text-sm text-yellow-500 font-medium">
                    ★ {review.rating} / 5
                  </span>
                </div>
                <p className="text-gray-700">{review.comment}</p>
                <div className="flex gap-4 text-sm text-gray-600 pt-2">
                  <button className="hover:text-blue-600">👍 {review.helpful}</button>
                  <button className="hover:text-red-500">👎 {review.unhelpful}</button>
                  <button className="ml-auto text-red-500 hover:underline">Report</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
