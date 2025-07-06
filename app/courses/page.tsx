'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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

  if (loading) return <p className="p-6 text-center text-gray-600">Loading...</p>;

  return (
    <main className="min-h-screen bg-gray-50 text-gray-800">
      {/* Hero */}
      <section className="bg-slate-900 text-white py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Courses at UF</h1>
        <p className="text-lg md:text-xl text-slate-300">
          Explore courses and find the right textbooks, reviewed by UF students.
        </p>
      </section>

      {/* Search */}
      <section className="max-w-3xl mx-auto px-4 mt-12">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search by course code or title..."
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
        <h2 className="text-2xl font-bold mb-8 text-center sm:text-left">Available Courses</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course: any) => (
            <div
              key={course.id}
              className="bg-white p-5 rounded-xl border border-gray-200 shadow hover:shadow-md transition"
            >
              <h3 className="text-lg font-semibold text-gray-900">{course.code}</h3>
              <p className="text-sm text-gray-600 mt-1">{course.title}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
