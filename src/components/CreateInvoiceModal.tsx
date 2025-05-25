import React, { useEffect, useState } from 'react';
import { Product } from '@/types/Product';

interface InvoiceItem {
  id?: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
  gst: number; // GST in AUD
  total: number;
  isCustom?: boolean;
}

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (invoice: any) => void;
  products: Product[];
}

const GST_RATE = 0.1; // 10% Australian GST

const initialItem: InvoiceItem = {
  name: '',
  description: '',
  quantity: 1,
  price: 0,
  gst: 0,
  total: 0,
  isCustom: false,
};

export default function CreateInvoiceModal({ isOpen, onClose, onSave, products }: CreateInvoiceModalProps) {
  const [customer, setCustomer] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [productOptions, setProductOptions] = useState<Product[]>(products);
  const [addingCustom, setAddingCustom] = useState(false);
  const [customItem, setCustomItem] = useState<InvoiceItem>(initialItem);
  const [selectedProductId, setSelectedProductId] = useState('');

  useEffect(() => {
    setProductOptions(products);
  }, [products]);

  const handleAddProduct = (productId: string) => {
    const product = productOptions.find(p => String(p.id) === String(productId));
    if (!product) return;
    setItems(prevItems => {
      // Check if already present (by id)
      const idx = prevItems.findIndex(i => String(i.id) === String(product.id) && !i.isCustom);
      if (idx > -1) {
        // Increment quantity and recalculate totals
        const updated = [...prevItems];
        const item = { ...updated[idx] };
        item.quantity += 1;
        item.gst = +(item.price * GST_RATE).toFixed(2);
        item.total = +((item.price + item.gst) * item.quantity).toFixed(2);
        updated[idx] = item;
        return updated;
      } else {
        const gst = +(Number(product.price) * GST_RATE).toFixed(2);
        const total = +(Number(product.price) + Number(gst));
        return [
          ...prevItems,
          {
            id: product.id,
            name: product.name,
            description: product.description,
            quantity: 1,
            price: Number(product.price),
            gst,
            total: +((Number(product.price) + Number(gst)) * 1).toFixed(2),
            isCustom: false,
          },
        ];
      }
    });
  };

  // Add selected product when selectedProductId changes
  useEffect(() => {
    if (selectedProductId) {
      handleAddProduct(selectedProductId);
      setSelectedProductId('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProductId]);

  const handleAddCustomItem = () => {
    const gst = +(customItem.price * GST_RATE).toFixed(2);
    const total = +((customItem.price + gst) * customItem.quantity).toFixed(2);
    setItems([
      ...items,
      {
        ...customItem,
        gst,
        total,
        isCustom: true,
      },
    ]);
    setCustomItem(initialItem);
    setAddingCustom(false);
  };

  const handleItemChange = (idx: number, key: keyof InvoiceItem, value: any) => {
    setItems(prev => {
      const updated = [...prev];
      let item = { ...updated[idx] };
      if (key === 'quantity' || key === 'price') {
        item[key] = Number(value);
        item.gst = +(item.price * GST_RATE).toFixed(2);
        item.total = +((item.price + item.gst) * item.quantity).toFixed(2);
      } else {
        (item as any)[key] = value;
      }
      updated[idx] = item;
      return updated;
    });
  };

  const handleRemoveItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const gstTotal = items.reduce((sum, item) => sum + item.gst * item.quantity, 0);
  const grandTotal = items.reduce((sum, item) => sum + item.total, 0);

  const handleSave = () => {
    if (!customer || items.length === 0) return;
    onSave({ customer, items, subtotal, gstTotal, grandTotal });
    setCustomer('');
    setItems([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 relative">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4">Create Invoice</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={customer}
            onChange={e => setCustomer(e.target.value)}
            placeholder="Enter customer name"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Add Product or Item</label>
          <div className="flex gap-2 mb-2">
            <select
              className="border rounded px-3 py-2 w-2/3"
              value={selectedProductId}
              onChange={e => setSelectedProductId(e.target.value)}
            >
              <option value="">Select a product...</option>
              {productOptions.map((p) => (
                <option key={p.id} value={p.id}>{p.name} (${typeof p.price === 'number' ? p.price.toFixed(2) : 'N/A'})</option>
              ))}
            </select>
            <button
              className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              onClick={() => setAddingCustom(true)}
              type="button"
            >
              + Custom Item
            </button>
          </div>
          {addingCustom && (
            <div className="bg-gray-100 rounded p-3 mb-2 flex flex-col gap-2">
              <input
                className="border rounded px-3 py-2"
                placeholder="Item name"
                value={customItem.name}
                onChange={e => setCustomItem({ ...customItem, name: e.target.value })}
              />
              <input
                className="border rounded px-3 py-2"
                placeholder="Description"
                value={customItem.description}
                onChange={e => setCustomItem({ ...customItem, description: e.target.value })}
              />
              <input
                className="border rounded px-3 py-2"
                type="number"
                min={1}
                placeholder="Quantity"
                value={customItem.quantity}
                onChange={e => setCustomItem({ ...customItem, quantity: Number(e.target.value) })}
              />
              <input
                className="border rounded px-3 py-2"
                type="number"
                min={0}
                step={0.01}
                placeholder="Unit price"
                value={customItem.price}
                onChange={e => setCustomItem({ ...customItem, price: Number(e.target.value) })}
              />
              <div className="flex gap-2 mt-2">
                <button
                  className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  type="button"
                  onClick={handleAddCustomItem}
                >
                  Add Item
                </button>
                <button
                  className="px-3 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  type="button"
                  onClick={() => setAddingCustom(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="mb-4">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-2 py-1 text-left">Item</th>
                <th className="px-2 py-1 text-left">Description</th>
                <th className="px-2 py-1 text-right">Qty</th>
                <th className="px-2 py-1 text-right">Unit Price</th>
                <th className="px-2 py-1 text-right">GST (10%)</th>
                <th className="px-2 py-1 text-right">Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx}>
                  <td className="px-2 py-1">{item.name}</td>
                  <td className="px-2 py-1">{item.description}</td>
                  <td className="px-2 py-1 text-right">
                    <input
                      type="number"
                      min={1}
                      className="w-14 border rounded px-1 py-0.5 text-right"
                      value={item.quantity}
                      onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                    />
                  </td>
                  <td className="px-2 py-1 text-right">
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      className="w-20 border rounded px-1 py-0.5 text-right"
                      value={item.price}
                      onChange={e => handleItemChange(idx, 'price', e.target.value)}
                    />
                  </td>
                  <td className="px-2 py-1 text-right">${(item.gst * item.quantity).toFixed(2)}</td>
                  <td className="px-2 py-1 text-right">${item.total.toFixed(2)}</td>
                  <td>
                    <button
                      className="text-red-500 hover:text-red-700 text-lg"
                      onClick={() => handleRemoveItem(idx)}
                      type="button"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-gray-400 py-4">No items added</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end gap-8 mb-4">
          <div>
            <div className="flex justify-between gap-4">
              <span className="font-medium">Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="font-medium">GST (10%)</span>
              <span>${gstTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-4 text-lg font-bold mt-2">
              <span>Total</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            onClick={handleSave}
            disabled={!customer || items.length === 0}
          >
            Create Invoice
          </button>
          <button
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
