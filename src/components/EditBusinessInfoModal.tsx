import React, { useState } from 'react';

interface EditBusinessInfoModalProps {
  isOpen: boolean;
  currentWebsite: string;
  currentLocation: string;
  currentIndustry: string;
  onClose: () => void;
  onSave: (website: string, location: string, industry: string) => Promise<void>;
}

const EditBusinessInfoModal: React.FC<EditBusinessInfoModalProps> = ({
  isOpen,
  currentWebsite,
  currentLocation,
  currentIndustry,
  onClose,
  onSave,
}) => {
  const [website, setWebsite] = useState(currentWebsite);
  const [location, setLocation] = useState(currentLocation);
  const [industry, setIndustry] = useState(currentIndustry);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSave = async () => {
    setError('');
    setLoading(true);
    try {
      await onSave(website.trim(), location.trim(), industry.trim());
      onClose();
    } catch (e) {
      setError('Failed to update business info.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Edit Business Information</h2>
        <label className="block mb-2 text-sm font-medium">Website</label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={website}
          onChange={e => setWebsite(e.target.value)}
          disabled={loading}
        />
        <label className="block mb-2 text-sm font-medium">Location</label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={location}
          onChange={e => setLocation(e.target.value)}
          disabled={loading}
        />
        <label className="block mb-2 text-sm font-medium">Industry</label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={industry}
          onChange={e => setIndustry(e.target.value)}
          disabled={loading}
        />
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
        <div className="flex justify-end gap-2 mt-4">
          <button
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
            onClick={handleSave}
            disabled={loading}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditBusinessInfoModal;
