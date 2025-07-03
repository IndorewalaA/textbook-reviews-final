'use client';

import { useState } from 'react';

export default function CoursesPage() {
  const [courses] = useState([
    { code: 'COP3502', name: 'Computer Science I' },
    { code: 'COP4600', name: 'Operating Systems' },
    { code: 'CDA3101', name: 'Intro to Computer Organization' },
    { code: 'CEN3031', name: 'Software Engineering' },
    { code: 'CNT4007C', name: 'Computer Networks' },
    { code: 'COP3530', name: 'Data Structures & Algorithms' },
  ]);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      {/* Header Section */}
      <div className="bg-blue-700 text-white py-20 px-4 text-center">
        <h1 className="text-5xl font-extrabold mb-3">Courses at UF</h1>
        <p className="text-lg md:text-xl">Explore courses and see what textbooks students are reviewing.</p>
      </div>

      {/* Course Grid */}
      <section className="mt-16 px-4 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Available Courses</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, i) => (
            <div
              key={i}
              className="bg-white p-5 rounded-xl shadow hover:shadow-md transition border border-gray-100"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {course.code}
              </h3>
              <p className="text-sm text-gray-600 mb-4">{course.name}</p>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                View Textbooks
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
