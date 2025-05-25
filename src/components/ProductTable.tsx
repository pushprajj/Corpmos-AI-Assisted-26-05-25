import React, { useState, useEffect, useRef } from 'react';
import { FaEdit, FaEllipsisV } from 'react-icons/fa';
import { Product } from '@/types/Product';

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (productToDelete: Product) => Promise<void>;
}

export default function ProductTable({ products, onEdit, onDelete }: ProductTableProps) {
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const dropdownRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleDropdownClick = (productId: string | undefined) => {
    if (productId) {
      setOpenDropdownId(openDropdownId === productId ? null : productId);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isClickOutside = dropdownRefs.current.every(ref => 
        !ref || !ref.contains(event.target as Node)
      );
      if (isClickOutside) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="bg-white rounded-xl shadow p-4 mt-4 overflow-x-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Product Summary</h2>
        {/* Add filter, show columns, dispatch selected, pagination controls here if needed */}
      </div>
      <table className="min-w-full">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-4 py-2 text-center">
              <input type="checkbox" />
            </th>
            <th className="px-4 py-2"></th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product name</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, idx) => (
            <tr key={product.id || idx} className="bg-white hover:bg-gray-50 transition border-b last:border-0">
              <td className="px-4 py-2 text-center">
                <input type="checkbox" />
              </td>
              <td className="px-4 py-2 text-center">
                <img src={product.photo_url || '/default-product.png'} alt={product.name} className="w-10 h-10 rounded-full object-cover" />
              </td>
              <td className="px-4 py-2 font-medium text-gray-800 min-w-[160px]">{product.name}</td>
              <td className="px-4 py-2 text-gray-700">{product.category}</td>
              <td className="px-4 py-2 text-gray-700">{product.sku}</td>
              <td className="px-4 py-2 text-gray-700">{product.quantity}</td>
              <td className="px-4 py-2 text-gray-700">${Number(product.cost).toFixed(2)}</td>
              <td className="px-4 py-2 text-gray-700">${Number(product.price).toFixed(2)}</td>
              <td className="px-4 py-2">
                <span className={`inline-block px-2 py-1 text-xs rounded font-semibold ${product.availability && product.availability === 'Available' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{product.availability || 'Unknown'}</span>
              </td>
              <td className="px-4 py-2 text-center">
                <div className="flex items-center gap-2 justify-center">
                  <button 
                    className="p-2 rounded-full hover:bg-indigo-50 transition" 
                    aria-label="Edit Product"
                    onClick={() => {
                      onEdit(product);
                    }}
                  >
                    <FaEdit className="text-indigo-600 w-4 h-4" />
                  </button>
                  <div 
                    className="relative" 
                    ref={(el) => {
                      if (product.id) {
                        const index = products.findIndex(p => p.id && p.id === product.id);
                        dropdownRefs.current[index] = el;
                      }
                    }}
                  >
                    <button 
                      className="p-2 rounded-full hover:bg-gray-100 transition" 
                      aria-label="More Actions"
                      onClick={() => handleDropdownClick(product.id)}
                    >
                      <FaEllipsisV className="text-gray-500 w-4 h-4" />
                    </button>
                    {product.id && openDropdownId === product.id && onDelete && (
                      <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="py-1">
                          <button
                            onClick={() => {
                              onDelete(product);
                              setOpenDropdownId(null);
                            }}
                            className="text-red-600 hover:bg-red-50 block w-full text-left px-4 py-2 text-sm"
                          >
                            Delete Product
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Pagination Controls */}
      <div className="flex items-center justify-between mt-4 px-2">
        <div className="text-sm text-gray-600">Rows per page <span className="font-medium">10</span></div>
        <div className="flex items-center gap-2">
          <button className="px-2 py-1 text-gray-400 hover:text-gray-700" disabled>{'<'}</button>
          <button className="px-2 py-1 text-gray-700 bg-gray-100 rounded">1</button>
          <button className="px-2 py-1 text-gray-700 hover:bg-gray-100 rounded">2</button>
          <button className="px-2 py-1 text-gray-700 hover:bg-gray-100 rounded">3</button>
          <span className="px-2">...</span>
          <button className="px-2 py-1 text-gray-700 hover:bg-gray-100 rounded">10</button>
          <button className="px-2 py-1 text-gray-400 hover:text-gray-700">{'>'}</button>
        </div>
        <div className="text-sm text-gray-600">1-5 of 100</div>
      </div>
    </div>
  );
}
