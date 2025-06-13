// src/components/admin/BookingCard.tsx
'use client';

import { Booking } from '@/types';

interface BookingCardProps {
  booking: Booking;
  formatDateDisplay: (isoDateString: string) => string;
  formatBookingStatus: (status: Booking['status']) => string;
  onConfirmBooking: (bookingId: string | undefined) => Promise<void>;
  onCancelBooking: (bookingId: string | undefined) => Promise<void>;
  isUpdatingBooking: string | null;
}

export default function BookingCard({
  booking,
  formatDateDisplay,
  formatBookingStatus,
  onConfirmBooking,
  onCancelBooking,
  isUpdatingBooking,
}: BookingCardProps) {
  const bookingIdStr = booking._id?.toString();

  console.log({ booking });
  return (
    <div
      key={bookingIdStr}
      className='p-4 border rounded-lg bg-slate-50 shadow-sm'
    >
      <div className='flex justify-between items-start mb-2'>
        <div>
          <h3 className='text-lg font-semibold text-purple-700'>
            {/* Assuming formatDateDisplay correctly handles ISO strings if booking.startTime is ISO */}
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
                : 'bg-red-100 text-red-700'
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
      {booking.status === 'pending_confirmation' && (
        <div className='mt-3 pt-3 border-t border-gray-200 flex space-x-2'>
          <button
            onClick={() => onConfirmBooking(bookingIdStr)}
            disabled={isUpdatingBooking === bookingIdStr}
            className='px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isUpdatingBooking === bookingIdStr ? 'Confirming...' : 'Confirm'}
          </button>
          <button
            onClick={() => onCancelBooking(bookingIdStr)}
            disabled={isUpdatingBooking === bookingIdStr}
            className='px-3 py-1.5 text-xs font-medium text-white bg-red-500 rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isUpdatingBooking === bookingIdStr ? 'Cancelling...' : 'Cancel'}
          </button>
        </div>
      )}
    </div>
  );
}
