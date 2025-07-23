'use client';

import { useState } from 'react';

export default function AdminPage() {
  const [modalType, setModalType] = useState<'course' | 'textbook' | null>(null);
  const closeModal = () => setModalType(null);

  const [courseData, setCourseData] = useState({ code: '', title: '' });
  const [textbookData, setTextbookData] = useState({
    courseId: '',
    title: '',
    author: '',
    edition: '',
    imageFile: null as File | null,
  });

  const handleCourseSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseData),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Course creation failed.');

      setCourseData({ code: '', title: '' });
      closeModal();
      alert(result.message || 'Course added!');
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to add course');
    }
  };

  const handleTextbookSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append('courseId', textbookData.courseId);
      formData.append('title', textbookData.title);
      formData.append('author', textbookData.author);
      formData.append('edition', textbookData.edition || '');
      if (textbookData.imageFile) {
        formData.append('image', textbookData.imageFile);
      }

      const res = await fetch('/api/textbooks', {
        method: 'POST',
        body: formData,
      });

      let result;
      try {
        result = await res.json();
      } catch {
        throw new Error('Invalid server response.');
      }

      if (!res.ok) throw new Error(result.error || 'Textbook creation failed.');

      setTextbookData({
        courseId: '',
        title: '',
        author: '',
        edition: '',
        imageFile: null,
      });
      closeModal();
      alert(result.message || 'Textbook added!');
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to add textbook');
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-800">
      <div className="max-w-3xl mx-auto px-6 py-14 space-y-12">
        <header className="text-center">
          <h1 className="text-5xl font-extrabold text-blue-700">Admin Dashboard</h1>
          <p className="text-lg text-gray-600 mt-4">Manage courses and textbooks</p>
        </header>

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
              onSubmit={modalType === 'course' ? handleCourseSubmit : handleTextbookSubmit}
              encType={modalType === 'textbook' ? 'multipart/form-data' : undefined}
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
                    placeholder="Course ID"
                    value={textbookData.courseId}
                    onChange={(e) =>
                      setTextbookData({ ...textbookData, courseId: e.target.value })
                    }
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Textbook Title"
                    value={textbookData.title}
                    onChange={(e) =>
                      setTextbookData({ ...textbookData, title: e.target.value })
                    }
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Author"
                    value={textbookData.author}
                    onChange={(e) =>
                      setTextbookData({ ...textbookData, author: e.target.value })
                    }
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Edition (optional)"
                    value={textbookData.edition}
                    onChange={(e) =>
                      setTextbookData({ ...textbookData, edition: e.target.value })
                    }
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                  <div className="flex flex-col space-y-2">
                    <label className="text-gray-700 font-medium">Upload Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setTextbookData({
                          ...textbookData,
                          imageFile: e.target.files?.[0] || null,
                        })
                      }
                      className="w-full"
                      required
                    />
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
