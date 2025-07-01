  'use client';

  import { useRef, useState } from 'react'

  export default function Profile() {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [previewURL, setPreviewURL] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    
    const handleButtonClick = () => {
      fileInputRef.current?.click();
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if(file) {
        setPreviewURL(URL.createObjectURL(file));
        uploadImage(file);
        console.log('Selected file:', file);
      }
    };

    const uploadImage = async(file: File) => {
      setUploading(true)
      const formData = new FormData();
      formData.append('image', file)
      try {
        const res = await fetch('/api/user', {
          method: 'POST', 
          body: formData,
        });

        if (!res.ok) {
          throw new Error('Upload failed!');
        }
        const { url } = await res.json();
      } catch (err) {
        console.error(err)
      } finally {
        setUploading(false);
      }
    }

    return (
      <div className="flex flex-col min-h-[calc(100vh-56px)] bg-gray-100 p-6 bg-gray-100 p-6">
        {/* Profile Container */}
        <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl p-8">
          {/* Page Title */}
          <h1 className="text-2xl font-bold mb-6 text-blue-500">Profile Settings</h1>

          {/* Main Grid: Profile Picture + Email/Password Update */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center">
              {previewURL ? (
                <img
                  src={previewURL}
                  alt="Profile Picture Preview"
                  className="w-32 h-32 rounded-full bg-gray-300 mb-4"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-300 mb-4"></div>
              )}
              <button 
                onClick={handleButtonClick}
                disabled={uploading}
                className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Change Profile Picture'}
              </button>
              <input
                type='file'
                accept="image/*"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="hidden"
              />
            </div>

            {/* Email and Password Update Section */}
            <div className="space-y-4">
              {/* Email Input */}
              <div>
                <label className="block font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  className="w-full mt-1 px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 text-black focus:ring-blue-400"
                  placeholder="you@example.com"
                />
              </div>

              {/* New Password Input */}
              <div>
                <label className="block font-medium text-gray-700">New Password</label>
                <input
                  type="password"
                  className="w-full mt-1 px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 text-black focus:ring-blue-400"
                  placeholder="••••••••"
                />
              </div>

              {/* Confirm Password Input */}
              <div>
                <label className="block font-medium text-gray-700">Confirm Password</label>
                <input
                  type="password"
                  className="w-full mt-1 px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 text-black focus:ring-blue-400"
                  placeholder="••••••••"
                />
              </div>

              {/* Save Button */}
              <button className="w-full py-2 mt-4 bg-green-500 text-white rounded-xl hover:bg-green-600">
                Save Changes
              </button>
            </div>
          </div>

          {/* Delete Account Section */}
          <div className="mt-12">
            <h2 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h2>
            <p className="text-sm text-gray-600 mb-4">
              Deleting your account is permanent and cannot be undone.
            </p>
            <button className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    );
  }
