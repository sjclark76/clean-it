// src/components/booking/BookingPageHeader.tsx
'use client';

import { CalendarIcon } from '@/components/icons/CalendarIcon'; // Adjust path if needed

export default function BookingPageHeader() {
  return (
    <header className='bg-white/80 backdrop-blur-md shadow-md sticky top-0 z-50'>
      <nav className='container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center'>
        <a
          href='/'
          className='text-2xl font-bold text-purple-600 hover:text-purple-500 transition-colors duration-300 flex items-center'
        >
          <CalendarIcon className='w-7 h-7 mr-2' />
          Jessiah's Car Cleaning
        </a>
        <a
          href='/'
          className='px-3 py-2 text-gray-700 hover:text-purple-600 transition-colors duration-300'
        >
          &larr; Back to Home
        </a>
      </nav>
    </header>
  );
}
