'use client';

import { SessionProvider } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/auth/signin' || pathname === '/auth/signup';

  return (
    <SessionProvider>
      {isAuthPage ? (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          {children}
        </div>
      ) : (
        <AuthenticatedLayout>{children}</AuthenticatedLayout>
      )}
    </SessionProvider>
  );
}