// src/app/booking/page.tsx
'use client';

import { CalendarIcon } from '@/components/icons/CalendarIcon'; // Adjust path if needed
import BookingPageHeader from '@/components/booking/BookingPageHeader'; // Import new header
import BookingForm from '@/components/booking/BookingForm'; // Import new form

export default function BookingPage() {
  const services = [
    'Exterior Wash & Wax',
    'Interior Deep Clean',
    'Full Detail Package',
    'Other (Please specify in notes)',
  ];

  return (
    <div className='min-h-screen bg-gray-100 text-gray-800 flex flex-col font-sans'>
      <BookingPageHeader />

      <main className='flex-grow py-12 md:py-20'>
        <div className='container mx-auto px-4 sm:px-6'>
          <div className='max-w-2xl mx-auto bg-white p-8 md:p-10 rounded-xl shadow-xl'>
            <div className='text-center mb-8'>
              <CalendarIcon className='w-12 h-12 text-purple-500 mx-auto mb-4' />
              <h1 className='text-3xl sm:text-4xl font-bold text-purple-600 mb-2'>
                Book Your Service
              </h1>
              <p className='text-gray-600 text-lg'>
                Fill out the form below and select an available 2-hour slot to
                request an appointment.
              </p>
            </div>

            <BookingForm services={services} />

            <p className='text-center text-gray-600 mt-8 text-sm'>
              Please note: This is a request. Your appointment is confirmed once
              Jessiah contacts you.
            </p>
          </div>
        </div>
      </main>

      <footer className='bg-gray-200 text-center py-10'>
        <div className='container mx-auto px-4 sm:px-6'>
          <p className='text-gray-600'>
            &copy; {new Date().getFullYear()} Jessiah's Car Cleaning.
          </p>
        </div>
      </footer>
    </div>
  );
}
