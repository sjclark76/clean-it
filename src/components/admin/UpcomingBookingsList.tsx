// src/components/admin/UpcomingBookingsList.tsx
'use client';

import { Booking } from '@/types';
import BookingCard from './BookingCard'; // Import the new BookingCard component

interface UpcomingBookingsListProps {
  bookings: Booking[];
  isLoading: boolean;
  error: string | null;
  formatDateDisplay: (isoDateString: string) => string;
  formatBookingStatus: (status: Booking['status']) => string;
  onConfirmBooking: (bookingId: string | undefined) => Promise<void>;
  onCancelBooking: (bookingId: string | undefined) => Promise<void>;
  isUpdatingBooking: string | null;
}

export default function UpcomingBookingsList({
  bookings,
  isLoading,
  error,
  formatDateDisplay,
  formatBookingStatus,
  onConfirmBooking,
  onCancelBooking,
  isUpdatingBooking,
}: UpcomingBookingsListProps) {
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
            <BookingCard
              key={booking._id}
              booking={booking}
              formatDateDisplay={formatDateDisplay}
              formatBookingStatus={formatBookingStatus}
              onConfirmBooking={onConfirmBooking}
              onCancelBooking={onCancelBooking}
              isUpdatingBooking={isUpdatingBooking}
            />
          ))}
        </div>
      )}
    </div>
  );
}
