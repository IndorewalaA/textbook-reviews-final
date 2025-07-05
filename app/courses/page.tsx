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
                const res = await fetch('api/courses', {
                    method: 'GET'
                });
                const data = await res.json();
                setCourses(data.courses);
            } catch (err) {
                console.error('Course fetch failed: ', err);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) {
            setError('Please enter a course code or name.');
            return;
        }
        setError('');
        router.push(`/search?q=${encodeURIComponent(query)}`);
    };

    if (loading) return <p className="p-4">Loading...</p>;

    return (
        <div className="min-h-screen bg-gray-100 text-gray-800">
            {/* Hero Section */}
            <div className="bg-blue-700 text-white py-20 px-4 text-center">
                <h1 className="text-5xl font-extrabold mb-3">Courses at UF</h1>
                <p className="text-lg md:text-xl">
                    Explore courses and find the right textbooks, reviewed by UF students.
                </p>
            </div>

            {/* Search Bar */}
            <form
                onSubmit={handleSearch}
                className="max-w-2xl mx-auto mt-10 px-4 flex items-center gap-2"
            >
                <input
                    type="text"
                    placeholder="Search for a course..."
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
            {error && (
                <p className="text-center text-red-600 mt-2 text-sm">{error}</p>
            )}

            {/* Course Grid */}
            <section className="mt-16 px-4 max-w-6xl mx-auto pb-24">
                <h2 className="text-2xl font-bold mb-8 text-center sm:text-left">
                    Available Courses
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {
                    courses.map((course: any) => (
                        <div key={course.id} className="bg-white p-4 shadow rounded">
                            <h2 className="text-xl font-semibold">{course.code}</h2>
                            <p>{course.title}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
