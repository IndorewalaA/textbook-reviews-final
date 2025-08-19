'use client';

import { useEffect, useMemo, useState } from 'react';

type Course = { id: string; code: string; title: string; slug: string };

export default function AdminPage() {
  const [modalType, setModalType] = useState<'course' | 'textbook' | null>(null);
  const closeModal = () => setModalType(null);
  const [courseData, setCourseData] = useState({ code: '', title: '' });
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseQuery, setCourseQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const [textbookTitle, setTextbookTitle] = useState('');
  const [textbookAuthor, setTextbookAuthor] = useState('');
  const [textbookEdition, setTextbookEdition] = useState('');
  const [textbookISBN, setTextbookISBN] = useState('');  // NEW
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [coursesError, setCoursesError] = useState('');
  useEffect(() => {
    const load = async () => {
      setLoadingCourses(true);
      setCoursesError('');
      try {
        const res = await fetch('/api/courses', { cache: 'no-store' });
        const text = await res.text();
        const data = text ? JSON.parse(text) : [];
        if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
        setCourses(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setCoursesError(e.message || 'Failed to load courses');
      } finally {
        setLoadingCourses(false);
      }
    };
    load();
  }, []);
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

  const filteredCourses = useMemo(() => {
    if (!courseQuery) return courses;
    const q = norm(courseQuery);
    return courses.filter((c) =>
      [c.code, c.title, c.slug].some((v) => norm(v).includes(q))
    );
  }, [courses, courseQuery]);

  const normalizeIsbn = (s: string) => s.replace(/[^0-9Xx]/g, '').toUpperCase();
  const handleCourseSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseData),
      });
      const text = await res.text();
      const result = text ? JSON.parse(text) : {};
      if (!res.ok) throw new Error(result.error || `Course creation failed (${res.status})`);

      setCourseData({ code: '', title: '' });
      alert(result.message || 'Course added!');
      const r2 = await fetch('/api/courses', { cache: 'no-store' });
      if (r2.ok) setCourses(await r2.json());

      closeModal();
    } catch (err: any) {
      alert(err.message || 'Failed to add course');
    }
  };

  const handleTextbookSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedCourse) return alert('Select a course first.');
    if (!textbookTitle || !textbookAuthor) return alert('Missing title/author.');
    if (!imageFile && !imageUrl) return alert('Provide an image file or an image URL.');

    try {
      setSubmitting(true);
      if (imageFile) {
        const form = new FormData();
        form.append('courseId', selectedCourse.id);
        form.append('courseSlug', selectedCourse.slug);
        form.append('title', textbookTitle);
        form.append('author', textbookAuthor);
        form.append('edition', textbookEdition);
        if (textbookISBN) form.append('isbn', normalizeIsbn(textbookISBN)); // NEW
        form.append('image', imageFile);

        const res = await fetch('/api/textbooks', { method: 'POST', body: form });
        const result = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(result.error || `Textbook creation failed (${res.status})`);
      } else {
        const res = await fetch('/api/textbooks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            courseId: selectedCourse.id,
            courseSlug: selectedCourse.slug,
            title: textbookTitle,
            author: textbookAuthor,
            edition: textbookEdition || null,
            imageUrl,
            isbn: textbookISBN ? normalizeIsbn(textbookISBN) : null, // NEW
          }),
        });
        const result = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(result.error || `Textbook creation failed (${res.status})`);
      }

      setSelectedCourse(null);
      setCourseQuery('');
      setTextbookTitle('');
      setTextbookAuthor('');
      setTextbookEdition('');
      setTextbookISBN('');
      setImageFile(null);
      setImageUrl('');

      alert('Textbook added!');
      closeModal();
    } catch (err: any) {
      alert(err.message || 'Failed to add textbook');
    } finally {
      setSubmitting(false);
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
              aria-label="Close"
            >
              &times;
            </button>

            <h2 className="text-3xl font-bold mb-6">
              {modalType === 'course' ? 'Add a New Course' : 'Add a New Textbook'}
            </h2>

            {modalType === 'course' ? (
              <form className="space-y-4" onSubmit={handleCourseSubmit}>
                <input
                  type="text"
                  placeholder="Course Code (e.g., COP3502)"
                  value={courseData.code}
                  onChange={(e) => setCourseData({ ...courseData, code: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
                <input
                  type="text"
                  placeholder="Course Title"
                  value={courseData.title}
                  onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
                >
                  Submit
                </button>
              </form>
            ) : (
              <form className="space-y-4" onSubmit={handleTextbookSubmit} encType="multipart/form-data">
                {/* Course selector */}
                <div>
                  <label className="text-sm font-medium text-gray-700">Course</label>
                  <input
                    type="text"
                    placeholder="Search (code, title, or slug)"
                    value={courseQuery}
                    onChange={(e) => setCourseQuery(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border rounded-md"
                  />
                  <div className="max-h-44 overflow-auto mt-2 border rounded-md bg-white">
                    {loadingCourses ? (
                      <div className="px-3 py-2 text-sm text-gray-500">Loading…</div>
                    ) : coursesError ? (
                      <div className="px-3 py-2 text-sm text-red-600">{coursesError}</div>
                    ) : filteredCourses.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-gray-500">No matches</div>
                    ) : (
                      filteredCourses.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setSelectedCourse(c)}
                          className={`w-full text-left px-3 py-2 hover:bg-gray-100 ${selectedCourse?.id === c.id ? 'bg-blue-50' : ''}`}
                          title={`${c.code} — ${c.title}`}
                        >
                          <span className="font-medium">{c.code}</span> — {c.title}{' '}
                          <span className="text-xs text-gray-500">({c.slug})</span>
                        </button>
                      ))
                    )}
                  </div>
                  {selectedCourse && (
                    <div className="text-sm mt-1 text-green-700">
                      Selected: <strong>{selectedCourse.code}</strong> — {selectedCourse.title} ({selectedCourse.slug})
                    </div>
                  )}
                </div>

                <input
                  type="text"
                  placeholder="Textbook Title"
                  value={textbookTitle}
                  onChange={(e) => setTextbookTitle(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg"
                  required
                />
                <input
                  type="text"
                  placeholder="Author"
                  value={textbookAuthor}
                  onChange={(e) => setTextbookAuthor(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg"
                  required
                />
                <input
                  type="text"
                  placeholder="Edition (optional)"
                  value={textbookEdition}
                  onChange={(e) => setTextbookEdition(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg"
                />

                {/* ISBN */}
                <input
                  type="text"
                  placeholder="ISBN (optional)"
                  value={textbookISBN}
                  onChange={(e) => setTextbookISBN(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg"
                />
                <p className="text-xs text-gray-500 -mt-2 mb-1">
                  Accepts ISBN-10 or ISBN-13; hyphens and spaces are okay.
                </p>

                {/* Image: URL OR file */}
                <div className="grid gap-3">
                  <input
                    type="url"
                    placeholder="Image URL (optional alternative to upload)"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg"
                  />
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                      className="w-full"
                    />
                    {imageFile && <span className="text-sm text-gray-600 truncate">{imageFile.name}</span>}
                  </div>
                  <p className="text-xs text-gray-500">
                    Provide <em>either</em> an image URL <em>or</em> upload a file. If both are provided, the file is used.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-60"
                >
                  {submitting ? 'Submitting…' : 'Submit'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
