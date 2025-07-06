'use client';

import { useRef, useState, useEffect } from 'react';

export default function Profile() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [currentURL, setCurrentURL] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) uploadImage(file);
  };

  const uploadImage = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetch('/api/user/pfp', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed!');
      const { url } = await res.json();
      const cacheBustedUrl = `${url}?t=${Date.now()}`;
      const img = new Image();
      img.src = cacheBustedUrl;
      img.onload = () => setCurrentURL(cacheBustedUrl);
    } catch {
      setStatusMessage({ text: 'Profile picture upload failed.', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password && password !== confirmPassword) {
      setStatusMessage({ text: 'Passwords must match!', type: 'error' });
      return;
    }

    try {
      const res = await fetch('/api/user', { method: 'PATCH', body: formData });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Update failed!');
      setStatusMessage({ text: 'Update successful! Check both emails to confirm.', type: 'success' });
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Something went wrong', type: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      await fetch('/api/user', { method: 'DELETE' });
      window.location.href = '/';
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        const res = await fetch('/api/user/pfp');
        if (!res.ok) throw new Error('Failed to fetch pfp.');
        const { url } = await res.json();
        const cacheBustedUrl = `${url}?t=${Date.now()}`;
        setCurrentURL(cacheBustedUrl);
      } catch (err) {
        console.error('Failed to fetch pfp.', err);
      }
    };
    fetchProfilePicture();
  }, []);

  useEffect(() => {
    if (statusMessage) {
      const timeout = setTimeout(() => setStatusMessage(null), 5000);
      return () => clearTimeout(timeout);
    }
  }, [statusMessage]);

  return (
    <main className="bg-gray-50 min-h-screen py-12 px-4 text-gray-800">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow">
        <h1 className="text-3xl font-bold mb-6 text-slate-800">Profile Settings</h1>

        {statusMessage && (
          <div
            className={`mb-6 px-4 py-3 rounded-lg border text-sm font-medium ${
              statusMessage.type === 'error'
                ? 'bg-red-100 text-red-700 border-red-300'
                : 'bg-green-100 text-green-700 border-green-300'
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center">
            {currentURL ? (
              <img
                src={currentURL}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover mb-4 shadow"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-300 mb-4 shadow"></div>
            )}
            <button
              onClick={handleButtonClick}
              disabled={uploading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {uploading ? 'Uploading...' : 'Change Picture'}
            </button>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="hidden"
            />
          </div>

          {/* User Info Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                name="username"
                className="mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                className="mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">New Password</label>
              <input
                type="password"
                name="password"
                className="mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                className="mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition"
            >
              Save Changes
            </button>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="mt-12">
          <h2 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h2>
          <p className="text-sm text-gray-600 mb-4">
            Deleting your account is permanent and cannot be undone.
          </p>
          <button
            type="button"
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            onClick={handleDelete}
          >
            Delete Account
          </button>
        </div>
      </div>
    </main>
  );
}
