'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import ImageUpload from '@/components/ImageUpload';

export default function EditProfile() {
  const router = useRouter();
  const { data: session } = useSession();
  const [business, setBusiness] = useState({
    name: '',
    description: '',
    website: '',
    location: '',
    industry: '',
    size: '',
    founded_year: '',
    logo: '',
    background_image: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      fetchBusinessDetails();
    }
  }, [session]);

  const fetchBusinessDetails = async () => {
    try {
      const response = await fetch(`/api/business/${session?.user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setBusiness({
          ...data,
          founded_year: data.founded_year?.toString() || '',
        });
      }
    } catch (error) {
      console.error('Error fetching business details:', error);
      setError('Failed to load business details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      console.log('Submitting business data:', business);
      const response = await fetch(`/api/business/${session?.user?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(business),
      });

      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/profile');
        }, 1500);
      } else {
        console.error('Update failed:', data);
        setError(data.details || data.error || 'Failed to update business details');
      }
    } catch (error) {
      console.error('Error updating business details:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBusiness((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Edit Business Profile</h1>
        <p className="mt-2 text-sm text-gray-600">
          Update your business information to keep your profile current and engaging.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-600">Profile updated successfully!</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-6">
          {/* Business Information */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="mb-8 space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Business Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={business.name}
                  onChange={handleChange}
                  className="mt-2 block h-10 w-full rounded-md border border-gray-300 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={business.description}
                  onChange={handleChange}
                  rows={4}
                  className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
                  Industry
                </label>
                <input
                  type="text"
                  id="industry"
                  name="industry"
                  value={business.industry}
                  onChange={handleChange}
                  className="mt-2 block h-10 w-full rounded-md border border-gray-300 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={business.location}
                  onChange={handleChange}
                  className="mt-2 block h-10 w-full rounded-md border border-gray-300 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="size" className="block text-sm font-medium text-gray-700">
                  Company Size
                </label>
                <select
                  id="size"
                  name="size"
                  value={business.size}
                  onChange={handleChange}
                  className="mt-2 block h-10 w-full rounded-md border border-gray-300 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="501-1000">501-1000 employees</option>
                  <option value="1000+">1000+ employees</option>
                </select>
              </div>

              <div>
                <label htmlFor="founded_year" className="block text-sm font-medium text-gray-700">
                  Founded Year
                </label>
                <input
                  type="number"
                  id="founded_year"
                  name="founded_year"
                  value={business.founded_year}
                  onChange={handleChange}
                  min="1900"
                  max={new Date().getFullYear()}
                  className="mt-2 block h-10 w-full rounded-md border border-gray-300 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                  Website
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={business.website}
                  onChange={handleChange}
                  className="mt-2 block h-10 w-full rounded-md border border-gray-300 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Images Section */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-lg font-semibold text-gray-900">Images</h2>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Logo</label>
                <div className="mt-2">
                  <ImageUpload
                    currentImage={business.logo}
                    onUploadComplete={(path: string) => setBusiness((prev) => ({ ...prev, logo: path }))}
                    uploadType="logo"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Background Image</label>
                <div className="mt-2">
                  <ImageUpload
                    currentImage={business.background_image}
                    onUploadComplete={(path: string) => setBusiness((prev) => ({ ...prev, background_image: path }))}
                    uploadType="background"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="mt-8 border-t border-gray-200 pt-6">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
} 