'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import SearchBar from '@/components/SearchBar';
import { slugify } from '@/utils/slugify';
import { FaStar } from 'react-icons/fa';

type SearchRow = {
  course_textbook_id: string;
  course_id: string;
  textbook_id: string;
  textbook_title: string;
  textbook_author: string | null;
  textbook_edition: string | null;
  textbook_image_path: string | null;
  textbook_isbn: string | null;
  course_code: string;
  course_title: string;
  average_rating: number;
  review_count: number;
};

export default function SearchPage() {
  // Put the hook user under Suspense
  return (
    <Suspense fallback={null}>
      <SearchContent />
    </Suspense>
  );
}

function SearchContent() {
  const params = useSearchParams();
  const q = (params.get('q') ?? '').trim();
  const [rows, setRows] = useState<SearchRow[] | null>(null);
  const [err, setErr] = useState<string>('');

  useEffect(() => {
    let active = true;
    setRows(null);
    setErr('');
    if (!q) return;

    (async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        if (!res.ok) throw new Error(`Search failed (${res.status})`);
        const data = (await res.json()) as SearchRow[];
        if (active) setRows(data);
      } catch (e) {
        if (active) setErr(e instanceof Error ? e.message : 'Failed to fetch search results.');
      }
    })();

    return () => {
      active = false;
    };
  }, [q]);

  return (
    <main className="min-h-screen bg-gray-50 text-gray-800">
      <section className="bg-slate-900 text-white py-16 px-4 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold">Search</h1>
        <p className="text-slate-300 mt-2">Find textbooks and the courses they’re used in.</p>
      </section>

      <SearchBar />

      <section className="max-w-6xl mx-auto px-4 mt-10 pb-24">
        {q && (
          <p className="text-sm text-gray-600 mb-4">
            Showing results for <span className="font-semibold">&ldquo;{q}&rdquo;</span>
          </p>
        )}

        {err && <p className="text-red-600">{err}</p>}

        {rows === null ? (
          q ? <p className="text-gray-600">Loading…</p> : <p className="text-gray-600">Enter a search term above.</p>
        ) : rows.length === 0 ? (
          <p className="text-gray-600">No matches found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rows.map((r) => {
              const courseSlug = slugify(r.course_title);
              const bookSlug = slugify(r.textbook_title);
              const href = `/courses/${courseSlug}/${bookSlug}`;

              const avg = Number(r.average_rating) || 0;
              const roundedHalf = Math.round(avg * 2) / 2;

              return (
                <Link
                  key={r.course_textbook_id}
                  href={href}
                  className="block bg-white p-5 rounded-xl border border-gray-200 shadow hover:shadow-lg transition text-slate-900 hover:ring-2 hover:ring-slate-500"
                >
                  <div className="flex gap-4">
                    {r.textbook_image_path ? (
                      <img
                        src={`https://urfkyhsntpwpwpsmskcz.supabase.co/storage/v1/object/public/textbooks/${r.textbook_image_path}`}
                        alt={r.textbook_title}
                        className="h-28 w-20 object-cover rounded-md shadow-sm"
                      />
                    ) : (
                      <div className="h-28 w-20 bg-gray-100 rounded-md" />
                    )}

                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{r.textbook_title}</h3>
                      {r.textbook_author && (
                        <p className="text-sm text-gray-600">by {r.textbook_author}</p>
                      )}
                      {r.textbook_edition && (
                        <p className="text-xs text-gray-500 italic">Edition: {r.textbook_edition}</p>
                      )}
                      {r.textbook_isbn && (
                        <p className="text-xs text-gray-500">ISBN: {r.textbook_isbn}</p>
                      )}

                      <div className="mt-2 text-sm text-gray-700">
                        <span className="font-medium">{r.course_code}</span> &middot; {r.course_title}
                      </div>

                      <div className="mt-2 text-sm flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => {
                          const full = i + 1 <= roundedHalf;
                          const half = i + 0.5 === roundedHalf;
                          return (
                            <FaStar
                              key={i}
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
                        <span className="ml-2 text-gray-700">
                          {avg.toFixed(1)}/5 · {r.review_count} review{r.review_count !== 1 && 's'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
