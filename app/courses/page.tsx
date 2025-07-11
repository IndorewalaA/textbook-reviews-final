import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import SearchBar from '@/components/SearchBar';

export default async function CoursesPage() {
  const supabase = await createClient();

  const { data: courseList, error: courseGetError } = await supabase
    .from('courses')
    .select('id, code, title');

  const { data: courseTextbooks, error: textbooksError } = await supabase
    .from('course_textbooks')
    .select('course_id');

  if (courseGetError || textbooksError || !courseList || !courseTextbooks) {
    throw new Error('Failed to fetch courses');
  }

  const textbookCounts: Record<string, number> = {};
  for (const entry of courseTextbooks) {
    textbookCounts[entry.course_id] = (textbookCounts[entry.course_id] || 0) + 1;
  }

  const courses = courseList
    .map((course) => ({
      ...course,
      textbookCount: textbookCounts[course.id] || 0,
    }))
    .sort((a, b) => {
      const aMatch = a.code.match(/^([A-Z]+)(\d+)/i);
      const bMatch = b.code.match(/^([A-Z]+)(\d+)/i);

      if (!aMatch || !bMatch) return a.code.localeCompare(b.code);

      const [, aPrefix, aNum] = aMatch;
      const [, bPrefix, bNum] = bMatch;

      if (aPrefix.toUpperCase() !== bPrefix.toUpperCase()) {
        return aPrefix.toUpperCase().localeCompare(bPrefix.toUpperCase());
      }

      return parseInt(aNum) - parseInt(bNum);
    });

  return (
    <main className="min-h-screen bg-gray-50 text-gray-800">
      {/* Hero */}
      <section className="bg-slate-900 text-white py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Courses at UF</h1>
        <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">
          Explore courses and find the right textbooks, reviewed by UF students.
        </p>
      </section>

      {/* Search*/}
      <SearchBar />

      {/* Course Grid */}
      <section className="max-w-6xl mx-auto px-4 mt-20 pb-24">
        <h2 className="text-2xl font-bold mb-8 text-center sm:text-left text-slate-900">
          Available Courses
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
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
      </section>
    </main>
  );
}
