// src/components/admin/UpcomingBookingsList.tsx
'use client';

import { Booking } from '@/types';

interface UpcomingBookingsListProps {
  bookings: Booking[];
  isLoading: boolean;
  error: string | null;
  formatDateDisplay: (dateString: string) => string;
  formatBookingStatus: (status: Booking['status']) => string;
}

export default function UpcomingBookingsList({
  bookings,
  isLoading,
  error,
  formatDateDisplay,
  formatBookingStatus,
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
            <div
              key={booking._id.toString()}
              className='p-4 border rounded-lg bg-slate-50 shadow-sm'
            >
              <div className='flex justify-between items-start mb-2'>
                <div>
                  <h3 className='text-lg font-semibold text-purple-700'>
                    {formatDateDisplay(booking.date)} @ {booking.startTime} -{' '}
                    {booking.endTime}
                  </h3>
                  <p className='text-sm text-gray-600'>
                    Service: {booking.serviceType}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    booking.status === 'confirmed'
                      ? 'bg-green-100 text-green-700'
                      : booking.status === 'pending_confirmation'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700' // for cancelled
                  }`}
                >
                  {formatBookingStatus(booking.status)}
                </span>
              </div>
              <div className='text-sm space-y-1'>
                <p>
                  <strong>Client:</strong> {booking.clientName}
                </p>
                <p>
                  <strong>Email:</strong>{' '}
                  <a
                    href={`mailto:${booking.clientEmail}`}
                    className='text-purple-600 hover:underline'
                  >
                    {booking.clientEmail}
                  </a>
                </p>
                <p>
                  <strong>Phone:</strong>{' '}
                  <a
                    href={`tel:${booking.clientPhone}`}
                    className='text-purple-600 hover:underline'
                  >
                    {booking.clientPhone}
                  </a>
                </p>
                {booking.notes && (
                  <p>
                    <strong>Notes:</strong> {booking.notes}
                  </p>
                )}
              </div>
              {/* Add buttons for Confirm/Cancel actions here if needed */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
