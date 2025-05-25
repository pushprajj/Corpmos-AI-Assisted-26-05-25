'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (status === 'authenticated') {
    return null; // Redirect will handle this
  }

  return (
    <div className="min-h-screen bg-gray-200 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Welcome to Corpmos</h1>
      <p className="text-lg text-gray-600 mb-8">Manage your business with ease.</p>
      <div className="space-x-4">
        <Link href="/auth/signin" className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700">
          Sign In
        </Link>
        <Link href="/auth/signup" className="bg-gray-200 text-gray-800 px-6 py-3 rounded-md hover:bg-gray-300">
          Sign Up
        </Link>
      </div>
    </div>
  );
}