// src/components/admin/BookingCard.tsx
'use client';

import { Booking } from '@/types';
import { formatDateDisplay } from '@/shared/timeFunctions';
import { useAtom, useSetAtom } from 'jotai/index';
import {
  editMessageAtom,
  editMessageTypeAtom,
  isUpdatingBookingAtom,
  upcomingBookingsAtom,
} from '@/components/admin/state';

interface BookingCardProps {
  booking: Booking;
}

const formatBookingStatus = (status: Booking['status']) => {
  switch (status) {
    case 'pending_confirmation':
      return 'Pending';
    case 'confirmed':
      return 'Confirmed';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
};

export default function BookingCard({ booking }: BookingCardProps) {
  const bookingIdStr = booking._id?.toString();
  const setEditMessage = useSetAtom(editMessageAtom);
  const setEditMessageType = useSetAtom(editMessageTypeAtom);
  const [isUpdatingBooking, setIsUpdatingBooking] = useAtom(
    isUpdatingBookingAtom
  );
  const setUpcomingBookings = useSetAtom(upcomingBookingsAtom);

  const handleUpdateBookingStatus = async (
    bookingId: string | undefined,
    action: 'confirm' | 'cancel'
  ) => {
    if (!bookingId) return;

    setIsUpdatingBooking(bookingId);
    setEditMessage(null);
    setEditMessageType(null);

    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const result = await response.json();

      if (response.ok) {
        if (action === 'cancel') {
          setUpcomingBookings((prevBookings) =>
            prevBookings.filter((b) => b._id?.toString() !== bookingId)
          );
          setEditMessage(result.message || 'Booking cancelled successfully.');
          setEditMessageType('success');
        } else if (action === 'confirm' && result.booking) {
          const updatedBookingFromServer = result.booking as Booking;
          setUpcomingBookings((prevBookings) =>
            prevBookings.map((b) =>
              b._id?.toString() === bookingId ? updatedBookingFromServer : b
            )
          );
          setEditMessage(result.message || 'Booking confirmed successfully.');
          setEditMessageType('success');
        } else if (action === 'confirm' && !result.booking) {
          setEditMessage(
            result.message ||
              'Confirmation processed, but booking data was not returned.'
          );
          setEditMessageType('error');
        }
      } else {
        setEditMessage(result.message || `Failed to ${action} booking.`);
        setEditMessageType('error');
      }
    } catch {
      setEditMessage(
        `An unexpected error occurred while ${action}ing the booking.`
      );
      setEditMessageType('error');
    } finally {
      setIsUpdatingBooking(null);
    }
  };

  const onConfirmBooking = (bookingId: string | undefined) =>
    handleUpdateBookingStatus(bookingId, 'confirm');
  const onCancelBooking = (bookingId: string | undefined) =>
    handleUpdateBookingStatus(bookingId, 'cancel');

  return (
    <div
      key={bookingIdStr}
      className='p-4 border rounded-lg bg-slate-50 shadow-sm'
    >
      {/* ... (rest of the card content remains the same) ... */}
      <div className='flex justify-between items-start mb-2'>
        <div>
          <h3 className='text-lg font-semibold text-purple-700'>
            {formatDateDisplay(booking.date)} @ {booking.startTime} -{' '}
            {booking.endTime}
          </h3>
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

      {/* Action buttons section */}
      {/* Show actions if booking is not already cancelled */}
      {booking.status !== 'cancelled' && (
        <div className='mt-3 pt-3 border-t border-gray-200 flex space-x-2'>
          {booking.status === 'pending_confirmation' && (
            <button
              onClick={() => onConfirmBooking(bookingIdStr)}
              disabled={isUpdatingBooking === bookingIdStr}
              className='px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isUpdatingBooking === bookingIdStr ? 'Confirming...' : 'Confirm'}
            </button>
          )}
          {/* Show Cancel button if status is pending_confirmation OR confirmed */}
          {(booking.status === 'pending_confirmation' ||
            booking.status === 'confirmed') && (
            <button
              onClick={() => onCancelBooking(bookingIdStr)}
              disabled={isUpdatingBooking === bookingIdStr}
              className='px-3 py-1.5 text-xs font-medium text-white bg-red-500 rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isUpdatingBooking === bookingIdStr ? 'Cancelling...' : 'Cancel'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
