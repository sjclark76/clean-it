// src/app/booking/page.tsx
'use client';

import Link from 'next/link'; // Import Link
import { CalendarIcon } from '@/components/icons/CalendarIcon';
import BookingForm from '@/components/booking/BookingForm';
import SecondaryPageHeader from '@/components/shared/SecondaryPageHeader';
import Footer from '@/components/shared/Footer';
import { CheckCircleIcon } from '@/components/icons/CheckCircleIcon';
import { useAtom } from 'jotai/index';
import { isBookingSuccessfulAtom } from '@/components/booking/state';

export default function BookingPage() {
  const [isBookingSuccessful, setIsBookingSuccessful] = useAtom(
    isBookingSuccessfulAtom
  );

  const handleSuccessfulBooking = () => {
    setIsBookingSuccessful(true);
  };

  return (
    <div className='min-h-screen bg-gray-100 text-gray-800 flex flex-col font-sans'>
      <SecondaryPageHeader />

      <main className='flex-grow py-12 md:py-20'>
        <div className='container mx-auto px-4 sm:px-6'>
          <div className='max-w-2xl mx-auto bg-white p-8 md:p-10 rounded-xl shadow-xl'>
            {isBookingSuccessful ? (
              // Success Message Display
              <div className='text-center'>
                <CheckCircleIcon className='w-16 h-16 text-green-500 mx-auto mb-4' />
                <h1 className='text-3xl sm:text-4xl font-bold text-green-600 mb-3'>
                  Booking Request Sent!
                </h1>
                <p className='text-gray-700 text-lg mb-6'>
                  Thank you for your request. Jessiah will contact you shortly
                  to confirm your appointment details.
                </p>
                <div className='mt-8 space-y-4 sm:space-y-0 sm:flex sm:justify-center sm:space-x-4'>
                  <button
                    onClick={() => setIsBookingSuccessful(false)} // Allow booking again
                    className='w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg transition-all'
                  >
                    Book Another Service
                  </button>
                  <Link
                    href='/'
                    className='w-full sm:w-auto inline-block text-center bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-lg transition-all'
                  >
                    Back to Homepage
                  </Link>
                </div>
              </div>
            ) : (
              // Original Form Display
              <>
                <div className='text-center mb-8'>
                  <CalendarIcon className='w-12 h-12 text-purple-500 mx-auto mb-4' />
                  <h1 className='text-3xl sm:text-4xl font-bold text-purple-600 mb-2'>
                    Book Your Service
                  </h1>
                  <p className='text-gray-600 text-lg'>
                    Fill out the form below and select an available 2-hour slot
                    to request an appointment.
                  </p>
                </div>

                <BookingForm
                  onBookingSuccess={handleSuccessfulBooking} // Pass the handler
                />

                <p className='text-center text-gray-600 mt-8 text-sm'>
                  Please note: This is a request. Your appointment is confirmed
                  once Jessiah contacts you.
                </p>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
