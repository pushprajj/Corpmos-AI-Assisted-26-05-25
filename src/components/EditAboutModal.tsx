import React, { useState } from 'react';
import dynamic from 'next/dynamic';
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

interface EditAboutModalProps {
  isOpen: boolean;
  currentDescription: string;
  onClose: () => void;
  onSave: (desc: string) => Promise<void>;
}

const EditAboutModal: React.FC<EditAboutModalProps> = ({ isOpen, currentDescription, onClose, onSave }) => {
  const [description, setDescription] = useState(currentDescription);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSave = async () => {
    setError('');
    setLoading(true);
    try {
      await onSave(description.trim());
      onClose();
    } catch (e) {
      setError('Failed to update About section.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
        <h2 className="text-xl font-semibold mb-2">Edit About Us</h2>
<p className="text-gray-600 mb-4 text-sm">Describe your business in detail here (e.g., mission, values, history, what makes you unique...)</p>

<ReactQuill
  theme="snow"
  value={description}
  onChange={setDescription}
  readOnly={loading}
  className="mb-2"
  placeholder="Describe your business in detail here (e.g., mission, values, history, what makes you unique...)"
  modules={{
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['blockquote', 'code-block'],
      ['clean']
    ]
  }}
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

export default EditAboutModal;
