// app/not-found.tsx
export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-5xl font-extrabold text-blue-700 mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
        <p className="text-gray-600">Sorry, we couldn’t find what you were looking for.</p>
      </div>
    </div>
  );
}
