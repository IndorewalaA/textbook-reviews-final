'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      setError('Please enter a search term.');
      return;
    }
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      {/* Hero Section */}
      <div className="bg-blue-700 text-white py-20 px-4 text-center">
        <h1 className="text-5xl font-extrabold mb-3">RateYourTextbooks</h1>
        <p className="text-lg md:text-xl">Find honest reviews. Choose the right textbook for every course at UF.</p>
      </div>

      {/* Search */}
      <form
        onSubmit={handleSearch}
        className="max-w-2xl mx-auto mt-10 px-4 flex items-center gap-2"
      >
        <input
          type="text"
          placeholder="Search for a course or textbook..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-grow p-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-400 outline-none transition"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
        >
          Search
        </button>
      </form>

      {/* Error Message */}
      {error && (
        <p className="text-center text-red-600 mt-2">{error}</p>
      )}

      {/* Recently Reviewed */}
      <section className="mt-16 px-4 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Recently Reviewed Textbooks</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((_, i) => (
            <div
              key={i}
              className="bg-white p-5 rounded-xl shadow hover:shadow-md transition border border-gray-100"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Example Textbook Title
              </h3>
              <p className="text-sm text-gray-500 mb-2">COP4600 – Operating Systems</p>
              <div className="flex items-center gap-1 text-yellow-400 mb-2">
                {'★★★★★'.split('').map((star, i) => (
                  <span key={i}>★</span>
                ))}
              </div>
              <p className="text-sm text-gray-700 italic">"Pretty solid book, but a bit dry..."</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
