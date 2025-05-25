import React, { useState, useEffect } from 'react';
import { Listbox } from '@headlessui/react';
import { Product } from '@/types/Product';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  productToEdit?: Product | null;
  onEditProduct?: (product: Product) => void;
}

const initialProduct = {
  name: '',
  description: '',
  quantity: 0,
  cost: 0.0,
  price: 0.0,
  photo_url: '',
  availability: 'Available',
  business_id: '',
  sku: '',
  category: '',
};

const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose, onSave, productToEdit }) => {
  const [product, setProduct] = useState(productToEdit || initialProduct);

  // Reset product state when modal is opened or product to edit changes
  useEffect(() => {
    setProduct(productToEdit || initialProduct);
  }, [isOpen, productToEdit]);



  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave(product);
    setProduct(initialProduct);
  };



  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen overflow-y-scroll flex items-center justify-center bg-black bg-opacity-30 modal-scroll-wrapper">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
        <h2 className="text-xl font-semibold mb-4">{productToEdit ? 'Edit Product' : 'Add New Product'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-gray-700">Product Name</label>
            <input
              className="w-full border rounded px-3 py-2"
              type="text"
              name="name"
              value={product.name}
              onChange={handleChange}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-gray-700">Quantity</label>
            <input
              className="w-full border rounded px-3 py-2"
              type="number"
              name="quantity"
              value={product.quantity}
              onChange={handleChange}
            />
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              className="w-full border rounded px-3 py-2"
              name="description"
              value={product.description}
              onChange={handleChange}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-gray-700">Cost</label>
            <input
              className="w-full border rounded px-3 py-2"
              type="number"
              name="cost"
              value={product.cost}
              onChange={handleChange}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-gray-700">Price</label>
            <input
              className="w-full border rounded px-3 py-2"
              type="number"
              name="price"
              value={product.price}
              onChange={handleChange}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-gray-700">Photo URL</label>
            <input
              className="w-full border rounded px-3 py-2"
              type="text"
              name="photo_url"
              value={product.photo_url}
              onChange={handleChange}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-gray-700">SKU</label>
            <input
              className="w-full border rounded px-3 py-2"
              type="text"
              name="sku"
              value={product.sku}
              onChange={handleChange}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <input
              className="w-full border rounded px-3 py-2"
              type="text"
              name="category"
              value={product.category}
              onChange={handleChange}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-gray-700">Availability</label>
            <Listbox value={product.availability} onChange={val => setProduct(prev => ({ ...prev, availability: val }))}>
              <div className="relative">
                <Listbox.Button className="w-full border rounded px-3 py-2 bg-white text-left">
                  {product.availability}
                </Listbox.Button>
                <Listbox.Options className="absolute z-50 mt-1 w-full bg-white border rounded shadow-lg max-h-60 overflow-auto">
                  <Listbox.Option
                    value="Available"
                    className={({ active }) => `cursor-pointer select-none px-4 py-2 ${active ? 'bg-indigo-100' : ''}`}
                  >
                    Available
                  </Listbox.Option>
                  <Listbox.Option
                    value="Not Available"
                    className={({ active }) => `cursor-pointer select-none px-4 py-2 ${active ? 'bg-indigo-100' : ''}`}
                  >
                    Not Available
                  </Listbox.Option>
                </Listbox.Options>
              </div>
            </Listbox>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;
