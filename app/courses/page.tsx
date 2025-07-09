'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch('api/courses');
        const data = await res.json();

        const sortedCourses = data.courses.sort((a: any, b: any) =>
          a.code.toUpperCase().localeCompare(b.code.toUpperCase(), undefined, { numeric: true })
        );

        setCourses(sortedCourses);
      } catch (err) {
        console.error('Course fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      setError('Please enter a course code or name.');
      return;
    }
    setError('');
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-800">
      {/* Hero */}
      <section className="bg-slate-900 text-white py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Courses at UF</h1>
        <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">
          Explore courses and find the right textbooks, reviewed by UF students.
        </p>
      </section>

      {/* Search */}
      <section className="max-w-3xl mx-auto px-4 mt-12">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search for a course, textbook, or author..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-grow px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 transition outline-none"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            Search
          </button>
        </form>
        {error && <p className="mt-2 text-sm text-red-600 text-center">{error}</p>}
      </section>

      {/* Course Grid */}
      <section className="max-w-6xl mx-auto px-4 mt-20 pb-24">
        <h2 className="text-2xl font-bold mb-8 text-center sm:text-left text-slate-900">
          Available Courses
        </h2>

        {loading ? (
          <p className="text-center text-gray-500 text-lg py-10">Loading courses...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course: any) => (
              <Link
                key={course.id}
                href={`/courses/${course.code.toLowerCase()}`}
                className="block bg-white p-6 rounded-xl border border-gray-200 shadow hover:shadow-lg transition text-slate-900 hover:cursor-pointer hover:ring-2 hover:ring-slate-500"
              >
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-semibold">{course.code}</h3>
                  <p>{course.title}</p>
                  <span className="inline-block self-start bg-blue-100 text-slate-900 font-medium px-3 py-1 rounded-full text-sm shadow-sm">
                    {course.textbookCount} textbook{course.textbookCount !== 1 ? 's' : ''}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
