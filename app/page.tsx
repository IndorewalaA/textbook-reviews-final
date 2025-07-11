'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SearchBar from '@/components/SearchBar'

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      setError('Please enter a search term.');
      return;
    }
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Hero Section */}
      <section className="bg-slate-900 text-white py-20 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
          RateYourTextbooks
        </h1>
        <p className="text-lg md:text-xl text-slate-300">
          Discover real student reviews. Find the best textbooks for every UF course.
        </p>
      </section>

      {/* Search Section */}
      <SearchBar/>

      {/* Popular Textbooks Section */}
      <section className="max-w-6xl mx-auto mt-20 px-4">
        <h2 className="text-2xl font-bold mb-6 text-center sm:text-left">
          Popular Textbooks
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((_, i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 p-5 rounded-xl shadow hover:shadow-md transition"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Example Textbook Title
              </h3>
              <p className="text-sm text-gray-500 mb-2">
                COP4600 – Operating Systems
              </p>
              <div className="flex items-center text-yellow-500 text-sm mb-2">
                {Array.from({ length: 5 }).map((_, j) => (
                  <span key={j}>★</span>
                ))}
              </div>
              <p className="text-sm text-gray-700 italic">
                "Pretty solid book, but a bit dry..."
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
