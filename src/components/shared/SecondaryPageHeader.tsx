// src/components/shared/SecondaryPageHeader.tsx
'use client';

import { CalendarIcon } from '@/components/icons/CalendarIcon';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react'; // Import useSession and signOut

export default function SecondaryPageHeader() {
  const { status } = useSession(); // Get session status

  return (
    <header className='bg-white/80 backdrop-blur-md shadow-md sticky top-0 z-50'>
      <nav className='container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center'>
        <Link
          href='/'
          className='text-2xl font-bold text-purple-600 hover:text-purple-500 transition-colors duration-300 flex items-center'
        >
          <CalendarIcon className='w-7 h-7 mr-2' />
          Jessiah&apos;s Car Spa
        </Link>
        <div className='flex items-center space-x-4'>
          {' '}
          {/* Wrapper for right-side links/buttons */}
          <Link
            href='/'
            className='px-3 py-2 text-gray-700 hover:text-purple-600 transition-colors duration-300'
          >
            &larr; Back to Home
          </Link>
          {/* Conditionally render logout button if user is authenticated */}
          {status === 'authenticated' && (
            <button
              onClick={() => signOut({ callbackUrl: '/' })} // Sign out and redirect to homepage
              className='bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105'
            >
              Logout
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}
