            import { useSession } from 'next-auth/react';
import type { Session } from 'next-auth';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Business } from '@/types/Business';
import { FiHome, FiBox, FiBarChart2, FiShoppingCart, FiUsers, FiGlobe, FiFolder, FiMapPin, FiUser, FiMenu, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useSidebar } from './SidebarContext';

const getNavItems = (session: Session | null) => [
  { name: 'Dashboard', href: '/dashboard', icon: <FiHome size={22}/> },
  { name: 'Profile', href: `/${session?.user?.username}`, icon: <FiUser size={22}/> },
  { name: 'Products', href: '/products', icon: <FiBox size={22}/> },
  { name: 'Sales', href: '/sales', icon: <FiShoppingCart size={22}/> },
  { name: 'Procurement', href: '/dashboard/procurement', icon: <FiUsers size={22}/> },
  { name: 'Analytics', href: '/dashboard/analytics', icon: <FiBarChart2 size={22}/> },
  { name: 'Intranet', href: '/dashboard/intranet', icon: <FiGlobe size={22}/> },
  { name: 'Resources', href: '/dashboard/resources', icon: <FiFolder size={22}/> },
];

export default function DashboardNavbar() {
  const { data: session } = useSession();
  console.log('DashboardNavbar rendered with session:', session);
  const pathname = usePathname();
  console.log('DashboardNavbar rendered on pathname:', pathname);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBusiness() {
      if (session?.user?.id) {
        setLoading(true);
        try {
          const res = await fetch(`/api/business/${session.user.id}`);
          if (res.ok) {
            const data = await res.json();
            // Debug log API response
            console.log('Fetched business data for navbar:', data);
            console.log('Business object:', data);
            console.log('Business logo value:', data.logo);
            setBusiness(data || {});
          } else {
            setBusiness(null);
          }
        } catch (err) {
          setBusiness(null);
          console.error('Error fetching business for navbar:', err);
        } finally {
          setLoading(false);
        }
      }
    }
    fetchBusiness();
  }, [session?.user?.id]);

  // Normalize logo path for Next.js Image
  // Debug: log business and logo at render
  if (typeof window !== 'undefined') {
    console.log('DashboardNavbar render: business =', business);
    if (business) {
      console.log('DashboardNavbar render: business.logo =', business.logo);
    }
  }

  let businessLogo: string = '/default-logo.png';
  if (!loading && business && business.logo && business.logo.trim() !== '') {
    businessLogo = business.logo.startsWith('http') || business.logo.startsWith('/')
      ? business.logo
      : '/' + business.logo;
  }

  const businessName = business?.name || session?.user?.business_name || session?.user?.name || 'Your Business';
  const { collapsed, toggleSidebar } = useSidebar();

  return (
    <aside
      className={`fixed left-0 z-30 bg-white border-r border-gray-200 flex flex-col justify-between shadow-lg transition-all duration-200 ${collapsed ? 'w-16' : 'w-64'}`}
      style={{ top: '48px', height: 'calc(100vh - 48px)' }}
    >
      {/* Collapse/Expand Toggle Button */}
      <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-end'} py-2 px-2 border-b border-gray-100`}> 
        <button
          onClick={toggleSidebar}
          className="p-2 rounded hover:bg-gray-100 transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <FiMenu size={22} /> : <FiChevronLeft size={22} />}
        </button>
      </div>
      {/* Navigation Section */}
      <nav className={`flex-1 flex flex-col py-6 gap-2 overflow-y-auto ${collapsed ? 'items-center' : ''}`}>
        {getNavItems(session).map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center ${collapsed ? 'justify-center' : ''} gap-3 ${collapsed ? 'px-0' : 'px-5'} py-2 rounded-md transition-colors duration-150 relative group text-base font-medium ${isActive ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-100 hover:text-blue-700'}`}
              style={{ textDecoration: 'none', width: '100%' }}
            >
              {/* Colored bar for active item */}
              <span className={`absolute left-0 top-1 bottom-1 w-1 rounded bg-blue-600 transition-all duration-150 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'} ${collapsed ? 'hidden' : ''}`}></span>
              <span>{item.icon}</span>
              {!collapsed && <span className="truncate">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Company Branding at Bottom */}
      <div className={`flex-shrink-0 flex flex-col ${collapsed ? 'items-center justify-center px-0' : 'items-start px-6'} gap-2 py-6 border-t border-gray-100 bg-white w-full`}>
        <div className={`flex ${collapsed ? 'justify-center' : 'items-center'} gap-2 w-full`}>
          <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            ) : (
              <Image
                src={businessLogo}
                alt="Business Logo"
                width={36}
                height={36}
                className="object-cover rounded-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/default-logo.png';
                }}
              />
            )}
          </div>
          {!collapsed && (
            <span className="text-gray-800 text-base font-semibold truncate max-w-[120px] text-left" title={businessName}>{businessName}</span>
          )}
        </div>
        {!collapsed && business?.tagline && (
          <span className="text-xs text-gray-500 italic max-w-[150px] truncate text-left" title={business.tagline}>{business.tagline}</span>
        )}
      </div>
    </aside>
  );
}
