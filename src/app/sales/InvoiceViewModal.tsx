import React from 'react';

interface InvoiceViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: any | null;
}

export default function InvoiceViewModal({ isOpen, onClose, invoice }: InvoiceViewModalProps) {
  if (!isOpen || !invoice) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-4">Invoice {invoice.id}</h2>
        <div className="mb-2">
          <span className="font-medium">Customer:</span> {invoice.customer || '-'}
        </div>
        <div className="mb-2">
          <span className="font-medium">Date:</span> {invoice.date}
        </div>
        <div className="mb-2">
          <span className="font-medium">Status:</span> {invoice.status}
        </div>
        <div className="mb-4">
          <span className="font-medium">Amount:</span> ${invoice.amount?.toFixed ? invoice.amount.toFixed(2) : invoice.amount}
        </div>
        {/* If items are present, show them */}
        {invoice.items && Array.isArray(invoice.items) && (
          <div className="mb-4">
            <h3 className="font-medium mb-2">Items</h3>
            <table className="min-w-full border text-sm">
              <thead>
                <tr>
                  <th className="border px-2 py-1">Name</th>
                  <th className="border px-2 py-1">Description</th>
                  <th className="border px-2 py-1">Qty</th>
                  <th className="border px-2 py-1">Price</th>
                  <th className="border px-2 py-1">GST</th>
                  <th className="border px-2 py-1">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item: any, idx: number) => (
                  <tr key={idx}>
                    <td className="border px-2 py-1">{item.name}</td>
                    <td className="border px-2 py-1">{item.description}</td>
                    <td className="border px-2 py-1">{item.quantity}</td>
                    <td className="border px-2 py-1">${item.price?.toFixed ? item.price.toFixed(2) : item.price}</td>
                    <td className="border px-2 py-1">${item.gst?.toFixed ? item.gst.toFixed(2) : item.gst}</td>
                    <td className="border px-2 py-1">${item.total?.toFixed ? item.total.toFixed(2) : item.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
