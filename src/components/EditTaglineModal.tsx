import React, { useState } from 'react';

interface EditTaglineModalProps {
  isOpen: boolean;
  currentTagline: string;
  onClose: () => void;
  onSave: (newTagline: string) => Promise<void>;
}

const EditTaglineModal: React.FC<EditTaglineModalProps> = ({ isOpen, currentTagline, onClose, onSave }) => {
  const [tagline, setTagline] = useState(currentTagline);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!tagline.trim()) {
      setError('Tagline cannot be empty.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onSave(tagline.trim());
      onClose();
    } catch (e) {
      setError('Failed to update tagline.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Edit Tagline</h2>
        <input
          type="text"
          className="w-full border border-gray-300 rounded px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={tagline}
          onChange={e => setTagline(e.target.value)}
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
            className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTaglineModal;
