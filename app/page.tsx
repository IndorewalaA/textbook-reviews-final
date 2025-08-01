'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SearchBar from '@/components/SearchBar';
import { slugify } from '@/utils/slugify';
import { motion } from 'framer-motion';
import clsx from 'clsx';

type PopularTextbook = {
  id: string;
  average_rating: number;
  review_count: number;
  textbooks: {
    title: string;
    image_path: string | null;
  };
  courses: {
    code: string;
    title: string;
  };
};

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [popular, setPopular] = useState<PopularTextbook[]>([]);
  const [centerIndex, setCenterIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const res = await fetch('/api/textbooks/popular');
        const data = await res.json();
        setPopular(data);
      } catch (err) {
        console.error('Failed to fetch popular textbooks:', err);
      }
    };
    fetchPopular();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      setError('Please enter a search term.');
      return;
    }
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const handlePrev = () => {
    setCenterIndex((prev) => (prev - 1 + popular.length) % popular.length);
  };

  const handleNext = () => {
    setCenterIndex((prev) => (prev + 1) % popular.length);
  };

  const getItem = (offset: number) =>
    popular[(centerIndex + offset + popular.length) % popular.length];

  return (
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
          >
            {'<'}
          </button>

          <div className="flex justify-center items-stretch gap-6 w-full max-w-4xl">
            {[getItem(-1), getItem(0), getItem(1)].map((item, i) => {
              if (!item) return null;
              const isCenter = i === 1;
              const linkHref = `/courses/${slugify(item.courses.title)}/${slugify(item.textbooks.title)}`;
              return (
                <a
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
                    <div className="flex justify-center items-center text-yellow-500 text-sm">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <span key={j}>{j < Math.round(item.average_rating) ? '★' : '☆'}</span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400">
                      {item.review_count} review{item.review_count !== 1 && 's'}
                    </p>
                  </div>
                </a>
              );
            })}
          </div>

          <button
            onClick={handleNext}
            className="absolute right-0 z-10 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-blue-700 transition"
          >
            {'>'}
          </button>
        </div>
      </section>
    </main>
  );
}
