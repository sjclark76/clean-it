// src/components/shared/SecondaryPageHeader.tsx
'use client';

import { CalendarIcon } from '@/components/icons/CalendarIcon';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';
import { MenuIcon } from '@/components/icons/MenuIcon';
import { XIcon } from '@/components/icons/XIcon'; // Import useState

export default function SecondaryPageHeader() {
  const { status } = useSession(); // Get session status
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className='bg-white/80 backdrop-blur-md shadow-md sticky top-0 z-50'>
      <nav className='container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center'>
        <Link
          href='/'
          className='text-xl sm:text-2xl font-bold text-purple-600 hover:text-purple-500 transition-colors duration-300 flex items-center'
        >
          <CalendarIcon className='w-6 h-6 sm:w-7 sm:h-7 mr-2' />
          Jessiah&apos;s Car Spa
        </Link>

        {/* Desktop Menu */}
        <div className='hidden md:flex items-center space-x-4'>
          <Link
            href='/'
            className='px-3 py-2 text-gray-700 hover:text-purple-600 transition-colors duration-300'
          >
            &larr; Back to Home
          </Link>
          {status === 'authenticated' && (
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className='bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105'
            >
              Logout
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className='md:hidden'>
          <button
            onClick={toggleMobileMenu}
            aria-label='Toggle menu'
            className='text-gray-700 hover:text-purple-600 focus:outline-none'
          >
            {isMobileMenuOpen ? (
              <XIcon className='w-7 h-7' />
            ) : (
              <MenuIcon className='w-7 h-7' />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu - Dropdown */}
      {isMobileMenuOpen && (
        <div className='md:hidden bg-white shadow-lg absolute top-full left-0 right-0 z-40'>
          <div className='container mx-auto px-4 py-4 flex flex-col space-y-3'>
            <Link
              href='/'
              className='block px-3 py-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors duration-300'
              onClick={toggleMobileMenu} // Close menu on click
            >
              &larr; Back to Home
            </Link>
            {status === 'authenticated' && (
              <button
                onClick={() => {
                  signOut({ callbackUrl: '/' });
                  toggleMobileMenu(); // Close menu on click
                }}
                className='w-full text-left block bg-purple-600 hover:bg-purple-700 text-white font-semibold px-3 py-3 rounded-lg transition-all duration-300'
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
