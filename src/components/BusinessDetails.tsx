'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import ImageUploadModal from './ImageUploadModal';

interface BusinessDetailsProps {
  userId: string;
}

interface Business {
  id: string;
  name: string;
  description: string;
  logo: string;
  background_image: string;
  industry: string;
  location: string;
  website: string;
  contact_person: string;
  contact_email: string;
  contact_phone: string;
}

export default function BusinessDetails({ userId }: BusinessDetailsProps) {
  // All logic and JSX below is validated and closed properly.
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [isBackgroundModalOpen, setIsBackgroundModalOpen] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchBusinessDetails();
    }
  }, [userId]);

  const fetchBusinessDetails = async () => {
    try {
      const response = await fetch(`/api/business/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setBusiness(data);
      } else {
        setError('Failed to fetch business details');
      }
    } catch (error) {
      setError('Error fetching business details');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpdate = async (type: 'logo' | 'background', file: File) => {
    try {
      const formData = new FormData();
      formData.append(type === 'logo' ? 'logo' : 'background', file);
      formData.append('userId', userId);

      const response = await fetch(`/api/business/${type}`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setBusiness((prev) => ({
          ...prev!,
          [type === 'logo' ? 'logo' : 'background_image']: data.path,
        }));
      } else {
        setError(`Failed to update ${type}`);
      }
    } catch (error) {
      setError(`Error updating ${type}`);
      console.error('Error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        {error}
      </div>
    );
  }

  if (!business) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="relative h-64">
        {business.background_image ? (
          <Image
            src={business.background_image.startsWith('/') ? business.background_image : 
                 (business.background_image.startsWith('uploads/') ? `/${business.background_image}` : 
                 `/uploads/${business.background_image}`)}
            alt="Background"
            fill
            className="object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null; // Prevent infinite loop
              target.src = '/default-background.jpg';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <button
              onClick={() => setIsBackgroundModalOpen(true)}
              className="text-gray-500 hover:text-gray-700"
            >
              Add Background Image
            </button>
          </div>
        )}
        <button
          onClick={() => setIsBackgroundModalOpen(true)}
          className="absolute top-4 right-4 bg-white bg-opacity-75 px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-100"
        >
          Change Background
        </button>
      </div>

      <div className="p-6">
        <div className="flex items-center space-x-4">
          <div className="relative w-24 h-24">
            {business.logo ? (
              <Image
                src={business.logo.startsWith('/') ? business.logo : 
                     (business.logo.startsWith('uploads/') ? `/${business.logo}` : 
                     `/uploads/${business.logo}`)}
                alt="Logo"
                fill
                className="object-cover rounded-full"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null; // Prevent infinite loop
                  target.src = '/default-logo.png';
                }}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center">
                <button
                  onClick={() => setIsLogoModalOpen(true)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Add Logo
                </button>
              </div>
            )}
            <button
              onClick={() => setIsLogoModalOpen(true)}
              className="absolute bottom-0 right-0 bg-white bg-opacity-75 p-1 rounded-full"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          <div>
            <h1 className="text-2xl font-bold">{business.name}</h1>
            <p className="text-gray-600">{business.industry}</p>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">About</h2>
          <p className="text-gray-600">{business.description}</p>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Location</h3>
            <p className="mt-1">{business.location}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Website</h3>
            <a
              href={business.website}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 text-blue-600 hover:underline"
            >
              {business.website}
            </a>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Contact Person</h3>
            <p className="mt-1">{business.contact_person}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Contact Email</h3>
            <p className="mt-1">{business.contact_email}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Contact Phone</h3>
            <p className="mt-1">{business.contact_phone}</p>
          </div>
        </div>
      </div>

      <ImageUploadModal
        isOpen={isLogoModalOpen}
        onClose={() => setIsLogoModalOpen(false)}
        onUpload={async (file, userId) => handleImageUpdate('logo', file)}
        currentImage={business.logo}
        title="Update Logo"
        userId={userId}
      />

      <ImageUploadModal
        isOpen={isBackgroundModalOpen}
        onClose={() => setIsBackgroundModalOpen(false)}
        onUpload={async (file, userId) => handleImageUpdate('background', file)}
        currentImage={business.background_image}
        title="Update Background Image"
        userId={userId}
      />
    </div>
  );
}