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
    if (file) {
      uploadImage(file);
      console.log('Selected file:', file);
    }
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

      if (!res.ok) {
        throw new Error('Upload failed!');
      }
      const { url } = await res.json();
      const cacheBustedUrl = `${url}?t=${Date.now()}`;
      const img = new Image();
      img.src = cacheBustedUrl;
      img.onload = () => {
        setCurrentURL(cacheBustedUrl);
      };
    } catch (err) {
      console.error(err);
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
      const res = await fetch('/api/user', {
        method: 'PATCH',
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Update failed!');
      setStatusMessage({ text: 'Update successful! Check both emails to confirm your new address.', type: 'success' });
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ text: err.message || 'Something went wrong', type: 'error' });
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

  // Auto-dismiss message
  useEffect(() => {
    if (statusMessage) {
      const timeout = setTimeout(() => setStatusMessage(null), 5000);
      return () => clearTimeout(timeout);
    }
  }, [statusMessage]);

  return (
    <div className="flex flex-col min-h-[calc(100vh-56px)] bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl p-8">
        <h1 className="text-2xl font-bold mb-6 text-blue-500">Profile Settings</h1>

        {/* Inline status message */}
        {statusMessage && (
          <div
            className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${
              statusMessage.type === 'error'
                ? 'bg-red-100 text-red-700 border border-red-300'
                : 'bg-green-100 text-green-700 border border-green-300'
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col items-center">
            {currentURL ? (
              <img
                src={currentURL ?? undefined}
                alt="Profile Picture Preview"
                className="w-32 h-32 rounded-full bg-gray-300 mb-4 shadow-md"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-300 mb-4 shadow-md"></div>
            )}
            <button
              onClick={handleButtonClick}
              disabled={uploading}
              className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 shadow-md"
            >
              {uploading ? 'Uploading...' : 'Change Profile Picture'}
            </button>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="hidden"
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-medium text-gray-700">Username</label>
              <input
                type="text"
                name="username"
                className="w-full mt-1 px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 text-black focus:ring-blue-400"
                placeholder="username"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                className="w-full mt-1 px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 text-black focus:ring-blue-400"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700">New Password</label>
              <input
                type="password"
                name="password"
                className="w-full mt-1 px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 text-black focus:ring-blue-400"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                className="w-full mt-1 px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 text-black focus:ring-blue-400"
                placeholder="••••••••"
              />
            </div>

            <button className="w-full py-2 mt-4 bg-green-500 text-white rounded-xl hover:bg-green-600 shadow-md">
              Save Changes
            </button>
          </form>
        </div>

        <div className="mt-12">
          <h2 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h2>
          <p className="text-sm text-gray-600 mb-4">
            Deleting your account is permanent and cannot be undone.
          </p>
          <button className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 shadow-md">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
