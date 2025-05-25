'use client';

import { useState, useEffect } from 'react';
import { 
  FiFileText, 
  FiDollarSign, 
  FiShoppingCart, 
  FiClipboard, 
  FiPlus,
  FiSearch,
  FiFilter,
  FiDownload,
  FiPrinter,
  FiBarChart2
} from 'react-icons/fi';
import CreateInvoiceModal from '@/components/CreateInvoiceModal';
import InvoiceViewModal from './InvoiceViewModal';

// Removed recentInvoices. Will use state instead.

const recentQuotes = [
  { id: 'QT-001', customer: 'Initech', date: '2023-05-16', amount: 1500.00, status: 'Sent' },
  { id: 'QT-002', customer: 'Umbrella Corp', date: '2023-05-10', amount: 3250.75, status: 'Draft' },
];

const recentSalesOrders = [
  { id: 'SO-001', customer: 'Wayne Enterprises', date: '2023-05-17', amount: 875.00, status: 'Received' },
  { id: 'SO-002', customer: 'Stark Industries', date: '2023-05-11', amount: 1250.00, status: 'Processing' },
];

export default function SalesPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [invoices, setInvoices] = useState([
    { id: 'INV-001', customer: 'Acme Corp', date: '2023-05-15', amount: 1250.00, status: 'Paid', items: [] },
    { id: 'INV-002', customer: 'Globex Inc', date: '2023-05-14', amount: 875.50, status: 'Pending', items: [] },
    { id: 'INV-003', customer: 'Soylent Corp', date: '2023-05-12', amount: 2450.00, status: 'Overdue', items: [] },
  ]);
  const [viewInvoice, setViewInvoice] = useState<any | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  // Fetch products for invoice modal
  useEffect(() => {
    if (invoiceModalOpen) {
      fetch('/api/products')
        .then(res => res.json())
        .then(data => setProducts(data.products || []))
        .catch(() => setProducts([]));
    }
  }, [invoiceModalOpen]);

  const handleSaveInvoice = (invoice: any) => {
    // Generate a mock invoice number and date
    const newId = `INV-${(invoices.length + 1).toString().padStart(3, '0')}`;
    const today = new Date();
    const date = today.toISOString().slice(0, 10);
    setInvoices([
      {
        id: newId,
        customer: invoice.customer,
        date,
        amount: invoice.grandTotal,
        status: 'Draft',
        items: invoice.items || [],
      },
      ...invoices,
    ]);
  };

  return (
    <div className="space-y-6 pt-2 ml-64">
      <CreateInvoiceModal
        isOpen={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        onSave={handleSaveInvoice}
        products={products}
      />
      <InvoiceViewModal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        invoice={viewInvoice}
      />
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Sales Dashboard</h1>
        <div className="flex space-x-3">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            onClick={() => setInvoiceModalOpen(true)}
          >
            <FiPlus className="mr-2" /> New Invoice
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
            <FiPlus className="mr-2" /> New Quote
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-800">$24,780</p>
              <p className="text-sm text-green-600">+12% from last month</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <FiDollarSign className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Open Invoices</p>
              <p className="text-2xl font-semibold text-gray-800">8</p>
              <p className="text-sm text-orange-600">2 overdue</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <FiFileText className="text-green-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Quotes</p>
              <p className="text-2xl font-semibold text-gray-800">5</p>
              <p className="text-sm text-blue-600">3 require follow-up</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <FiClipboard className="text-purple-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {[
              { id: 'overview', name: 'Overview', icon: <FiBarChart2 className="mr-2" /> },
              { id: 'quotes', name: 'Quotes', icon: <FiClipboard className="mr-2" /> },
              { id: 'sales-orders', name: 'Sales Orders', icon: <FiShoppingCart className="mr-2" /> },
              { id: 'invoices', name: 'Invoices', icon: <FiFileText className="mr-2" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-4 text-sm font-medium ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && <OverviewTab invoices={invoices} />}
          {activeTab === 'quotes' && <QuotesTab />}
          {activeTab === 'sales-orders' && <SalesOrdersTab />}
          {activeTab === 'invoices' && <InvoicesTab invoices={invoices} onView={inv => { setViewInvoice(inv); setViewModalOpen(true); }} />}
        </div>
      </div>
    </div>
  );
}

function OverviewTab({ invoices }: { invoices: any[] }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
        <button className="text-sm text-blue-600 hover:text-blue-800">View All</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-700 mb-3">Recent Invoices</h3>
          <div className="space-y-3">
            {invoices.slice(0, 3).map((invoice) => (
              <div key={invoice.id} className="p-3 bg-white rounded-lg shadow-xs hover:shadow-sm transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{invoice.id}</p>
                    <p className="text-sm text-gray-500">{invoice.customer}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    invoice.status === 'Paid' ? 'bg-green-100 text-green-800' : invoice.status === 'Overdue' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {invoice.status}
                  </span>
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <p className="text-sm font-medium">${invoice.amount.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">{invoice.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-700 mb-3">Recent Quotes</h3>
          <div className="space-y-3">
            {recentQuotes.map((quote) => (
              <div key={quote.id} className="p-3 bg-white rounded-lg shadow-xs hover:shadow-sm transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{quote.id}</p>
                    <p className="text-sm text-gray-500">{quote.customer}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    quote.status === 'Sent' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {quote.status}
                  </span>
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <p className="text-sm font-medium">${quote.amount.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">{quote.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-700 mb-3">Recent Sales Orders</h3>
          <div className="space-y-3">
            {recentSalesOrders.map((so) => (
              <div key={so.id} className="p-3 bg-white rounded-lg shadow-xs hover:shadow-sm transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{so.id}</p>
                    <p className="text-sm text-gray-500">{so.customer}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    so.status === 'Received' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {so.status}
                  </span>
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <p className="text-sm font-medium">${so.amount.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">{so.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function InvoicesTab({ invoices, onView }: { invoices: any[], onView: (invoice: any) => void }) {
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Search invoices..."
          />
        </div>
        <div className="flex space-x-3 w-full sm:w-auto">
          <button className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 flex items-center">
            <FiFilter className="mr-2 h-4 w-4" />
            Filter
          </button>
          <button className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 flex items-center">
            <FiDownload className="mr-2 h-4 w-4" />
            Export
          </button>
          <button className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 flex items-center">
            <FiPlus className="mr-2 h-4 w-4" />
            Create Invoice
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                  {invoice.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{invoice.customer}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${invoice.amount.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    invoice.status === 'Paid' ? 'bg-green-100 text-green-800' :
                    invoice.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {invoice.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-4" onClick={() => onView(invoice)}>View</button>
                  <button className="text-gray-600 hover:text-gray-900">
                    <FiPrinter className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function QuotesTab() {
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Search quotes..."
          />
        </div>
        <div className="flex space-x-3 w-full sm:w-auto">
          <button className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 flex items-center">
            <FiFilter className="mr-2 h-4 w-4" />
            Filter
          </button>
          <button className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 flex items-center">
            <FiPlus className="mr-2 h-4 w-4" />
            Create Quote
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quote #</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {recentQuotes.map((quote) => (
              <tr key={quote.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                  {quote.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{quote.customer}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{quote.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${quote.amount.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    quote.status === 'Sent' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {quote.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-4" onClick={() => onView(invoice)}>View</button>
                  <button className="text-blue-600 hover:text-blue-900 mr-4">Convert to Invoice</button>
                  <button className="text-gray-600 hover:text-gray-900">
                    <FiPrinter className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SalesOrdersTab() {
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Search sales orders..."
          />
        </div>
        <div className="flex space-x-3 w-full sm:w-auto">
          <button className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 flex items-center">
            <FiFilter className="mr-2 h-4 w-4" />
            Filter
          </button>
          <button className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 flex items-center">
            <FiPlus className="mr-2 h-4 w-4" />
            Create SO
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO #</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {recentSalesOrders.map((so) => (
              <tr key={so.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                  {so.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{so.customer}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{so.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${so.amount.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    so.status === 'Received' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {so.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-4" onClick={() => onView(invoice)}>View</button>
                  <button className="text-gray-600 hover:text-gray-900">
                    <FiPrinter className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}