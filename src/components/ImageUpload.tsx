'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FaCamera } from 'react-icons/fa';

interface ImageUploadProps {
  currentImage?: string;
  onUploadComplete: (path: string) => void;
  uploadType: 'logo' | 'background';
  userId: string;
}

export default function ImageUpload({ currentImage, onUploadComplete, uploadType, userId }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const defaultImage = uploadType === 'logo' ? '/default-logo.png' : '/default-background.jpg';

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset error state
    setError('');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('userId', userId);

      const response = await fetch(`/api/business/${uploadType === 'logo' ? 'logo' : 'background'}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      onUploadComplete(data.path);
    } catch (err) {
      setError('Failed to upload image. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative">
      <div className="relative aspect-square w-32 overflow-hidden rounded-lg border border-gray-200">
        <Image
          src={currentImage || defaultImage}
          alt={`${uploadType} preview`}
          fill
          className="object-cover"
        />
        <label
          htmlFor={`${uploadType}-upload`}
          className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black bg-opacity-50 opacity-0 transition-opacity hover:opacity-100"
        >
          <FaCamera className="h-6 w-6 text-white" />
          <input
            type="file"
            id={`${uploadType}-upload`}
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>
      {uploading && (
        <div className="mt-2 text-sm text-gray-600">Uploading...</div>
      )}
      {error && (
        <div className="mt-2 text-sm text-red-600">{error}</div>
      )}
    </div>
  );
} 