'use client';

import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import DashboardNavWrapper from './DashboardNavWrapper';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { FiUsers, FiDollarSign, FiPackage, FiAlertCircle, FiRefreshCw, FiBarChart2 } from 'react-icons/fi';
import { useCachedFetch } from '@/hooks/useCachedFetch';

interface DashboardStats {
  totalEmployees: number;
  totalSales: number;
  totalProducts: number;
}

// Mock API call to simulate data fetching
const fetchDashboardStats = async (): Promise<DashboardStats> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Simulate random errors (20% chance)
  if (Math.random() < 0.2) {
    throw new Error('Failed to fetch dashboard data');
  }

  return {
    totalEmployees: 42,
    totalSales: 125000,
    totalProducts: 156,
  };
};



export default function Dashboard() {
  const { data: session } = useSession();
  const { data: stats, isLoading, error, refetch } = useCachedFetch<DashboardStats>({
    key: 'dashboard_stats',
    fetchFn: fetchDashboardStats,
    ttl: 2 * 60 * 1000, // 2 minutes cache
    useLocalStorage: true, // Persist across page refreshes
  });

  if (isLoading) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" text="Loading dashboard data..." />
        </div>
      </AuthenticatedLayout>
    );
  }

  if (error) {
    return (
      <DashboardNavWrapper>
        <AuthenticatedLayout>
          {/* Welcome Section */}
          <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Welcome back, {session?.user?.name?.split(' ')[0] || 'User'}</h1>
                <p className="text-gray-600 mt-1">Here's what's happening with your business today</p>
              </div>
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center">
                <span className="mr-2">Quick Actions</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center justify-between">
              <div className="flex items-center">
                <FiAlertCircle className="mr-2" />
                <span>Failed to load dashboard data</span>
              </div>
              <button 
                onClick={() => refetch()}
                className="bg-white text-red-600 px-3 py-1 rounded-lg border border-red-300 text-sm flex items-center"
              >
                <FiRefreshCw className="mr-1" /> Retry
              </button>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-800">Employees</h2>
                <div className="p-2 bg-blue-50 text-blue-600 rounded-full">
                  <FiUsers size={20} />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats?.totalEmployees || '—'}</p>
              <div className="flex items-center mt-2">
                <span className="text-green-600 text-sm font-medium">+5%</span>
                <span className="text-gray-500 text-sm ml-2">from last month</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-800">Revenue</h2>
                <div className="p-2 bg-green-50 text-green-600 rounded-full">
                  <FiDollarSign size={20} />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {stats ? `$${stats.totalSales.toLocaleString()}` : '—'}
              </p>
              <div className="flex items-center mt-2">
                <span className="text-green-600 text-sm font-medium">+12%</span>
                <span className="text-gray-500 text-sm ml-2">from last month</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-800">Products</h2>
                <div className="p-2 bg-purple-50 text-purple-600 rounded-full">
                  <FiPackage size={20} />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats?.totalProducts || '—'}</p>
              <div className="flex items-center mt-2">
                <span className="text-green-600 text-sm font-medium">+3%</span>
                <span className="text-gray-500 text-sm ml-2">from last month</span>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Activity Feed - Takes 2 columns on large screens */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-800">Recent Activity</h2>
                <button className="text-indigo-600 text-sm font-medium hover:text-indigo-800">View All</button>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-start pb-5 border-b border-gray-100 last:border-0 last:pb-0">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 mr-4 overflow-hidden">
                        <img src={`https://randomuser.me/api/portraits/men/${i + 20}.jpg`} alt="User" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">John Doe updated a post</p>
                          <span className="text-xs text-gray-500">2h ago</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Added new product information and updated inventory status.</p>
                        <div className="mt-2 flex items-center space-x-3">
                          <button className="text-xs text-gray-500 hover:text-indigo-600 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                            </svg>
                            Like
                          </button>
                          <button className="text-xs text-gray-500 hover:text-indigo-600 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                            Comment
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Sidebar - Takes 1 column */}
            <div>
              {/* Upcoming Tasks */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
                <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-800">Upcoming Tasks</h2>
                  <button className="text-indigo-600 text-sm font-medium hover:text-indigo-800">Add Task</button>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <input type="checkbox" className="mr-3 h-4 w-4 text-indigo-600 rounded" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">Review quarterly sales report</p>
                          <p className="text-xs text-gray-500 mt-1">Due in {i} day{i !== 1 ? 's' : ''}</p>
                        </div>
                        <div className="flex-shrink-0 ml-2">
                          <span className={`inline-block w-2 h-2 rounded-full ${i === 1 ? 'bg-red-500' : i === 2 ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-4 text-center text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                    View All Tasks
                  </button>
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h2 className="text-lg font-medium text-gray-800">Quick Links</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <a href="#" className="flex flex-col items-center p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <FiUsers className="text-indigo-600 mb-2" size={20} />
                      <span className="text-sm text-gray-700">Team</span>
                    </a>
                    <a href="#" className="flex flex-col items-center p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <FiPackage className="text-indigo-600 mb-2" size={20} />
                      <span className="text-sm text-gray-700">Products</span>
                    </a>
                    <a href="#" className="flex flex-col items-center p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <FiDollarSign className="text-indigo-600 mb-2" size={20} />
                      <span className="text-sm text-gray-700">Sales</span>
                    </a>
                    <a href="#" className="flex flex-col items-center p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <FiBarChart2 className="text-indigo-600 mb-2" size={20} />
                      <span className="text-sm text-gray-700">Reports</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sales Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-800">Sales Overview</h2>
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-xs font-medium bg-indigo-600 text-white rounded-md">Monthly</button>
                <button className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-md">Quarterly</button>
                <button className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-md">Yearly</button>
              </div>
            </div>
            <div className="p-6 h-72 flex items-center justify-center">
              <div className="w-full h-full border border-gray-200 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Sales chart will be displayed here</p>
              </div>
            </div>
          </div>
        </AuthenticatedLayout>
      </DashboardNavWrapper>
    );
  }

  return (
    <DashboardNavWrapper>
      <AuthenticatedLayout>
        {/* Welcome Section */}
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Welcome back, {session?.user?.name?.split(' ')[0] || 'User'}</h1>
              <p className="text-gray-600 mt-1">Here's what's happening with your business today</p>
            </div>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center">
              <span className="mr-2">Quick Actions</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-800">Employees</h2>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-full">
                <FiUsers size={20} />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats?.totalEmployees || '—'}</p>
            <div className="flex items-center mt-2">
              <span className="text-green-600 text-sm font-medium">+5%</span>
              <span className="text-gray-500 text-sm ml-2">from last month</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-800">Revenue</h2>
              <div className="p-2 bg-green-50 text-green-600 rounded-full">
                <FiDollarSign size={20} />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {stats ? `$${stats.totalSales.toLocaleString()}` : '—'}
            </p>
            <div className="flex items-center mt-2">
              <span className="text-green-600 text-sm font-medium">+12%</span>
              <span className="text-gray-500 text-sm ml-2">from last month</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-800">Products</h2>
              <div className="p-2 bg-purple-50 text-purple-600 rounded-full">
                <FiPackage size={20} />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats?.totalProducts || '—'}</p>
            <div className="flex items-center mt-2">
              <span className="text-green-600 text-sm font-medium">+3%</span>
              <span className="text-gray-500 text-sm ml-2">from last month</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Activity Feed - Takes 2 columns on large screens */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-800">Recent Activity</h2>
              <button className="text-indigo-600 text-sm font-medium hover:text-indigo-800">View All</button>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-start pb-5 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 mr-4 overflow-hidden">
                      <img src={`https://randomuser.me/api/portraits/men/${i + 20}.jpg`} alt="User" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">John Doe updated a post</p>
                        <span className="text-xs text-gray-500">2h ago</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Added new product information and updated inventory status.</p>
                      <div className="mt-2 flex items-center space-x-3">
                        <button className="text-xs text-gray-500 hover:text-indigo-600 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                          </svg>
                          Like
                        </button>
                        <button className="text-xs text-gray-500 hover:text-indigo-600 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                          Comment
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Takes 1 column */}
          <div className="space-y-6">
            {/* Upcoming Tasks */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-800">Upcoming Tasks</h2>
                <button className="text-indigo-600 text-sm font-medium hover:text-indigo-800">Add Task</button>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <input type="checkbox" className="mr-3 h-4 w-4 text-indigo-600 rounded" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">Review quarterly sales report</p>
                        <p className="text-xs text-gray-500 mt-1">Due in {i} day{i !== 1 ? 's' : ''}</p>
                      </div>
                      <div className="flex-shrink-0 ml-2">
                        <span className={`inline-block w-2 h-2 rounded-full ${i === 1 ? 'bg-red-500' : i === 2 ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 text-center text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                  View All Tasks
                </button>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="border-b border-gray-200 px-6 py-4">
                <h2 className="text-lg font-medium text-gray-800">Quick Links</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <a href="#" className="flex flex-col items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <FiUsers className="text-indigo-600 mb-2" size={20} />
                    <span className="text-sm text-gray-700">Team</span>
                  </a>
                  <a href="#" className="flex flex-col items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <FiPackage className="text-indigo-600 mb-2" size={20} />
                    <span className="text-sm text-gray-700">Products</span>
                  </a>
                  <a href="#" className="flex flex-col items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <FiDollarSign className="text-indigo-600 mb-2" size={20} />
                    <span className="text-sm text-gray-700">Sales</span>
                  </a>
                  <a href="#" className="flex flex-col items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <FiBarChart2 className="text-indigo-600 mb-2" size={20} />
                    <span className="text-sm text-gray-700">Reports</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sales Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-800">Sales Overview</h2>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-xs font-medium bg-indigo-600 text-white rounded-md">Monthly</button>
              <button className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-md">Quarterly</button>
              <button className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-md">Yearly</button>
            </div>
          </div>
          <div className="p-6 h-72 flex items-center justify-center">
            <div className="w-full h-full bg-gray-50 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Sales chart will be displayed here</p>
            </div>
          </div>
        </div>
      </AuthenticatedLayout>
    </DashboardNavWrapper>
  );
}