// src/components/admin/UpcomingBookingsList.tsx
'use client';

import BookingCard from './BookingCard';
import { useAtomValue, useAtom } from 'jotai';
import {
  bookingsErrorAtom,
  isLoadingBookingsAtom,
  upcomingBookingsAtom,
} from '@/components/admin/state';

export default function UpcomingBookingsList() {
  const [bookings] = useAtom(upcomingBookingsAtom);
  const isLoading = useAtomValue(isLoadingBookingsAtom);
  const error = useAtomValue(bookingsErrorAtom);

  return (
    <div className='lg:col-span-2 bg-white p-6 md:p-8 rounded-xl shadow-xl'>
      <h2 className='text-xl md:text-2xl font-semibold mb-6 text-gray-700'>
        Upcoming Client Bookings
      </h2>
      {isLoading && <p className='text-gray-600'>Loading bookings...</p>}
      {error && <p className='text-red-600'>Error: {error}</p>}
      {!isLoading && !error && bookings.length === 0 && (
        <p className='text-gray-600'>No upcoming client bookings found.</p>
      )}
      {!isLoading && !error && bookings.length > 0 && (
        <div className='space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto pr-2'>
          {bookings.map((booking) => (
            <BookingCard key={booking._id?.toString()} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
}
