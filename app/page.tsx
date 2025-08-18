'use client';

import { useState, useEffect, Suspense } from 'react';
import SearchBar from '@/components/SearchBar';
import clsx from 'clsx';
import { FaStar } from 'react-icons/fa';
import Link from 'next/link';

type PopularTextbook = {
  id: string; // course_textbook_id
  average_rating: number;
  review_count: number;
  textbooks: {
    title: string;
    image_path: string | null;
    slug: string;
  };
  courses: {
    code: string;
    title: string;
    slug: string;
  };
};

export default function HomePage() {
  const [popular, setPopular] = useState<PopularTextbook[]>([]);
  const [centerIndex, setCenterIndex] = useState(0);

  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const res = await fetch('/api/textbooks/popular', { cache: 'no-store' });
        const data = (await res.json()) as PopularTextbook[];
        setPopular(data);
      } catch (err) {
        console.error('Failed to fetch popular textbooks:', err);
      }
    };
    fetchPopular();
  }, []);

  const handlePrev = () => {
    setCenterIndex((prev) => (popular.length ? (prev - 1 + popular.length) % popular.length : 0));
  };

  const handleNext = () => {
    setCenterIndex((prev) => (popular.length ? (prev + 1) % popular.length : 0));
  };

  const getItem = (offset: number) =>
    popular.length ? popular[(centerIndex + offset + popular.length) % popular.length] : undefined;

  return (
    <Suspense fallback={null}>
      <main className="min-h-screen bg-gray-50 text-gray-800">
        <section className="bg-slate-900 text-white py-20 px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            RateYourTextbooks
          </h1>
          <p className="text-lg md:text-xl text-slate-300">
            Discover real student reviews. Find the best textbooks for every UF course.
          </p>
        </section>

        <SearchBar />

        <section className="max-w-6xl mx-auto mt-20 px-4">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center sm:text-left">
            Popular Textbooks
          </h2>

          <div className="relative flex items-center justify-center min-h-[440px]">
            <button
              onClick={handlePrev}
              className="absolute left-0 z-10 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-blue-700 transition"
              aria-label="Previous"
            >
              {'<'}
            </button>

            <div className="flex justify-center items-stretch gap-6 w-full max-w-4xl">
              {[getItem(-1), getItem(0), getItem(1)].map((item, i) => {
                if (!item) return null;
                const isCenter = i === 1;
                const linkHref = `/courses/${item.courses.slug}/${item.textbooks.slug}?ctid=${item.id}`;

                const avg = Number(item.average_rating) || 0;
                const roundedHalf = Math.round(avg * 2) / 2;

                return (
                  <Link
                    key={`${item.id}-${i}`}
                    href={linkHref}
                    className={clsx(
                      'transition-all duration-500 ease-in-out bg-white border border-gray-200 px-4 py-3 rounded-xl shadow-md hover:shadow-lg text-center w-56 transform flex flex-col justify-between cursor-pointer',
                      isCenter ? 'scale-110 z-20' : 'scale-90 opacity-60 z-10'
                    )}
                  >
                    <div className="flex flex-col items-center h-44 mb-2">
                      {item.textbooks.image_path && (
                        <img
                          src={`https://urfkyhsntpwpwpsmskcz.supabase.co/storage/v1/object/public/textbooks/${item.textbooks.image_path}`}
                          alt={item.textbooks.title}
                          className="w-24 h-36 object-cover rounded shadow"
                        />
                      )}
                    </div>

                    <div className="flex flex-col justify-start h-full space-y-1">
                      <h3 className="text-base font-semibold text-gray-900 break-words line-clamp-2">
                        {item.textbooks.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Course Code:</span> {item.courses.code}
                      </p>

                      <div className="flex justify-center items-center text-sm">
                        {Array.from({ length: 5 }).map((_, j) => {
                          const full = j + 1 <= roundedHalf;
                          const half = j + 0.5 === roundedHalf;
                          return (
                            <FaStar
                              key={j}
                              size={14}
                              className={
                                full
                                  ? 'text-yellow-500'
                                  : half
                                  ? 'text-yellow-500 opacity-50'
                                  : 'text-gray-300'
                              }
                            />
                          );
                        })}
                      </div>

                      <p className="text-xs text-gray-400">
                        {item.review_count} review{item.review_count !== 1 && 's'}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>

            <button
              onClick={handleNext}
              className="absolute right-0 z-10 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-blue-700 transition"
              aria-label="Next"
            >
              {'>'}
            </button>
          </div>
        </section>
      </main>
    </Suspense>
  );
}
