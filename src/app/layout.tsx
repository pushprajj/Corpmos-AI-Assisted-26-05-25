// src/app/layout.tsx
'use client';
import React from 'react';
import { SessionProvider, useSession } from 'next-auth/react';
import { Inter } from 'next/font/google';
import { usePathname } from 'next/navigation';
import TopNavbar from '@/components/TopNavbar';
import DashboardNavbar from '@/components/DashboardNavbar';
import { PageWrapper } from '@/components/PageWrapper';
import { AuthProvider } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/components/SidebarContext';
import './globals.css';

// Configure Inter font with specific subsets and weights
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700'],
});

function RootContent({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const pathname = usePathname();
  const isSidebarRoute = status === 'authenticated' &&
    !pathname.startsWith('/login') &&
    !pathname.startsWith('/auth') &&
    !pathname.startsWith('/register');

  return (
    <div className="min-h-screen bg-gray-200">
      {status === 'authenticated' && <TopNavbar />}
      {status === 'authenticated' && isSidebarRoute && <DashboardNavbar />}
      <main className={status === 'authenticated' && isSidebarRoute ? 'pt-16 mt-1' : status === 'authenticated' ? 'pt-4' : ''}>
        <div className="mx-auto max-w-[1920px] px-4 sm:px-6 lg:px-8">
          <PageWrapper>{children}</PageWrapper>
        </div>
      </main>
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    const enforceScroll = () => {
      if (document.body.style.overflow === 'hidden') {
        document.body.style.overflowY = 'scroll';
        document.body.style.overflow = '';
      }
      if (document.documentElement.style.overflow === 'hidden') {
        document.documentElement.style.overflowY = 'scroll';
        document.documentElement.style.overflow = '';
      }
    };
    const observer = new MutationObserver(() => enforceScroll());
    observer.observe(document.body, { attributes: true, attributeFilter: ['style'] });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
    enforceScroll();
    return () => observer.disconnect();
  }, []);

  return (
    <html lang="en" className={`${inter.variable} font-sans`}>
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased dark:bg-gray-900 dark:text-gray-100">
        <SessionProvider>
          <AuthProvider>
            <SidebarProvider>
              <RootContent>{children}</RootContent>
            </SidebarProvider>
          </AuthProvider>
        </SessionProvider>
      </body>
    </html>
  );
}