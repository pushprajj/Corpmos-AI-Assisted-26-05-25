import { useSidebar } from '@/components/SidebarContext';

interface DashboardNavWrapperProps {
  children: React.ReactNode;
}

export default function DashboardNavWrapper({ children }: DashboardNavWrapperProps) {
  const { collapsed } = useSidebar();
  return (
    <main className={`flex-1 min-h-screen bg-gray-200 transition-all duration-200 ${collapsed ? 'ml-16' : 'ml-64'}`}>
      <div className="container mx-auto px-3 pt-0 pb-1 max-w-7xl">
        {children}
      </div>
    </main>
  );
}
