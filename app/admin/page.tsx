'use client';

import { useState } from 'react';

export default function AdminPage() {
  const [modalType, setModalType] = useState<'course' | 'textbook' | null>(null);
  const closeModal = () => setModalType(null);

  const [courseData, setCourseData] = useState({
    code: '',
    title: '',
  });

  const handleCourseSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/course', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: courseData.code,
          title: courseData.title,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Update failed!');

      // Optional: reset form and close modal
      setCourseData({ code: '', title: '' });
      closeModal();
    } catch (err: any) {
      console.error('Course submit failed:', err.message);
      alert(err.message);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-800">
      <div className="max-w-3xl mx-auto px-6 py-14 space-y-12">

        {/* Header */}
        <header className="text-center">
          <h1 className="text-5xl font-extrabold text-blue-700">Admin Dashboard</h1>
          <p className="text-lg text-gray-600 mt-4">Manage courses and textbooks</p>
        </header>

        {/* Action Buttons */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <button
            onClick={() => setModalType('course')}
            className="w-full py-6 text-xl font-semibold bg-blue-600 text-white rounded-2xl shadow-lg hover:bg-blue-700 active:scale-95 transition-transform duration-200"
          >
            + Add Course
          </button>
          <button
            onClick={() => setModalType('textbook')}
            className="w-full py-6 text-xl font-semibold bg-green-600 text-white rounded-2xl shadow-lg hover:bg-green-700 active:scale-95 transition-transform duration-200"
          >
            + Add Textbook
          </button>
        </section>
      </div>

      {/* Modal */}
      {modalType && (
        <div className="fixed inset-0 z-50 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-xl relative">
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
            >
              &times;
            </button>

            <h2 className="text-3xl font-bold mb-6">
              {modalType === 'course' ? 'Add a New Course' : 'Add a New Textbook'}
            </h2>

            <form
              className="space-y-4"
              onSubmit={modalType === 'course' ? handleCourseSubmit : undefined}
            >
              {modalType === 'course' ? (
                <>
                  <input
                    type="text"
                    placeholder="Course Code"
                    value={courseData.code}
                    onChange={(e) =>
                      setCourseData({ ...courseData, code: e.target.value })
                    }
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Course Title"
                    value={courseData.title}
                    onChange={(e) =>
                      setCourseData({ ...courseData, title: e.target.value })
                    }
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
                </>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Course Code"
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                  <input
                    type="text"
                    placeholder="Textbook Title"
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                  <input
                    type="text"
                    placeholder="Author"
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                  <input
                    type="text"
                    placeholder="Edition"
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                  <div className="flex items-center justify-between">
                    <label className="text-gray-700 font-medium">Upload Image</label>
                    <input type="file" accept="image/*" className="block w-full mt-1" />
                  </div>
                </>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
