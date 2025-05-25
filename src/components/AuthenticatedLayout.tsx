// src/components/AuthenticatedLayout.tsx
'use client';

import { useSession } from 'next-auth/react';
import Navbar from '@/components/Navbar';

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { status } = useSession();

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (status === 'authenticated') {
    return <>{children}</>;

  }

  return <>{children}</>;
}