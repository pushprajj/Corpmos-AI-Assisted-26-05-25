// src/components/TopNavbar.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { FaHome, FaUsers, FaEnvelope, FaBell, FaUser, FaSearch, FaBars } from 'react-icons/fa';
import Image from 'next/image';

export default function TopNavbar() {
  const [mounted, setMounted] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const meButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: session, status } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleDropdownToggle = () => {
    if (meButtonRef.current) {
      const rect = meButtonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.right - 192 // Subtract dropdown width
      });
      setDropdownOpen(!dropdownOpen);
    }
  };

  const handleLogout = () => {
    signOut({ callbackUrl: '/auth/signin' });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-10 bg-white flex items-center h-12 border-b border-gray-200">
      <div className="w-full px-4 lg:px-8">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/Corpmos Logo1.png" alt="Corpmos Logo" width={40} height={40} className="w-10 h-10 rounded bg-white object-contain" />
              <span className="text-2xl font-bold text-blue-600" style={{fontFamily: 'Segoe UI, sans-serif'}}>Corpmos</span>
            </Link>
            <div className="hidden md:block ml-10">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search profiles..."
                  className="w-96 p-2 border border-gray-200 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
                <FaSearch className="absolute right-3 top-2.5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-indigo-600"
            >
              <FaBars className="w-6 h-6" />
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="flex flex-col items-center text-gray-600 hover:text-indigo-600">
              <FaHome className="w-6 h-6 mb-0.5" />
              <span className="text-xs">Home</span>
            </Link>
            <Link href="/network" className="flex flex-col items-center text-gray-600 hover:text-indigo-600">
              <FaUsers className="w-6 h-6 mb-0.5" />
              <span className="text-xs">Network</span>
            </Link>
            <Link href="/messaging" className="flex flex-col items-center text-gray-600 hover:text-indigo-600">
              <FaEnvelope className="w-6 h-6 mb-0.5" />
              <span className="text-xs">Messaging</span>
            </Link>
            <Link href="/notifications" className="flex flex-col items-center text-gray-600 hover:text-indigo-600">
              <FaBell className="w-6 h-6 mb-0.5" />
              <span className="text-xs">Notifications</span>
            </Link>
            <div className="relative">
              {status === 'authenticated' ? (
                <div className="relative">
                  <button
                    ref={meButtonRef}
                    onClick={handleDropdownToggle}
                    className="flex flex-col items-center text-gray-600 hover:text-indigo-600 focus:outline-none"
                  >
                    <FaUser className="w-6 h-6 mb-0.5" />
                    <span className="text-xs">Me</span>
                  </button>
                  {dropdownOpen && mounted && createPortal(
                    <div 
                      className="fixed w-48 bg-white shadow-lg rounded-md py-2 z-[9999]"
                      style={{ top: `${dropdownPosition.top}px`, left: `${dropdownPosition.left}px` }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Link
                        href="/dashboard"
                        className="block px-4 py-2 text-gray-600 hover:bg-gray-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        href={`/${session?.user?.username}`}
                        className="block px-4 py-2 text-gray-600 hover:bg-gray-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>,
                    document.body
                  )}
                </div>
              ) : (
                <Link href="/auth/signin" className="text-gray-600 hover:text-indigo-600">
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Search profiles..."
                  className="w-full p-2 border border-gray-200 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
                <FaSearch className="absolute right-3 top-2.5 text-gray-400" />
              </div>
              <Link
                href="/"
                className="flex items-center px-3 py-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-50 rounded-md"
              >
                <FaHome className="w-5 h-5 mr-3" />
                Home
              </Link>
              <Link
                href="/network"
                className="flex items-center px-3 py-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-50 rounded-md"
              >
                <FaUsers className="w-5 h-5 mr-3" />
                Network
              </Link>
              <Link
                href="/messaging"
                className="flex items-center px-3 py-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-50 rounded-md"
              >
                <FaEnvelope className="w-5 h-5 mr-3" />
                Messaging
              </Link>
              <Link
                href="/notifications"
                className="flex items-center px-3 py-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-50 rounded-md"
              >
                <FaBell className="w-5 h-5 mr-3" />
                Notifications
              </Link>
              {status === 'authenticated' ? (
                <>
                  <Link
                    href="/dashboard"
                    className="flex items-center px-3 py-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-50 rounded-md"
                  >
                    <FaUser className="w-5 h-5 mr-3" />
                    Dashboard
                  </Link>
                  <Link
                    href={`/${session?.user?.username}`}
                    className="flex items-center px-3 py-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-50 rounded-md"
                  >
                    <FaUser className="w-5 h-5 mr-3" />
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-3 py-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-50 rounded-md"
                  >
                    <FaUser className="w-5 h-5 mr-3" />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/signin"
                  className="flex items-center px-3 py-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-50 rounded-md"
                >
                  <FaUser className="w-5 h-5 mr-3" />
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}