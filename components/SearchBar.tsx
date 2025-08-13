
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initial = searchParams.get('q') ?? '';
  const [query, setQuery] = useState(initial);
  const [error, setError] = useState('');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) {
      setError('Please enter a search term.');
      return;
    }
    setError('');
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 mt-8">
      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by course (e.g., COP3530), course title, book title/author, or ISBN…"
          className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Search textbooks and courses"
        />
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-5 py-3 text-white font-semibold shadow hover:bg-blue-700 transition"
        >
          Search
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
