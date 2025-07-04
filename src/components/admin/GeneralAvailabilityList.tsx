// src/components/admin/GeneralAvailabilityList.tsx
'use client';

import { Booking } from '@/types';
import { useAtomValue } from 'jotai';
import {
  availabilityErrorAtom,
  isLoadingAvailabilityAtom,
  upcomingAvailabilityAtom,
  upcomingBookingsAtom,
} from '@/components/admin/state';
import { formatDateDisplay, timeToMinutes } from '@/shared/timeFunctions';

export default function GeneralAvailabilityList() {
  const availability = useAtomValue(upcomingAvailabilityAtom);
  const isLoading = useAtomValue(isLoadingAvailabilityAtom);
  const error = useAtomValue(availabilityErrorAtom);
  const bookings = useAtomValue(upcomingBookingsAtom);

  const isGeneralSlotBooked = (
    slotTime: string,
    dayDate: string,
    currentBookings: Booking[] // Pass current bookings to ensure fresh data
  ): Booking['status'] | null => {
    const slotTimeInMinutes = timeToMinutes(slotTime);
    const activeBookingsForDay = currentBookings.filter(
      (b) => b.date === dayDate && b.status !== 'cancelled'
    );

    for (const booking of activeBookingsForDay) {
      const bookingStartMinutes = timeToMinutes(booking.startTime);
      const bookingCoversUntilMinutes = bookingStartMinutes + 150;

      if (
        slotTimeInMinutes >= bookingStartMinutes &&
        slotTimeInMinutes < bookingCoversUntilMinutes
      ) {
        return booking.status;
      }
    }
    return null;
  };

  return (
    <div className='lg:col-span-3 bg-white p-6 md:p-8 rounded-xl shadow-xl mt-8'>
      <h2 className='text-xl md:text-2xl font-semibold mb-6 text-gray-700'>
        Your Upcoming General Availability
      </h2>
      {/* ... isLoading, error, no availability messages ... */}
      {!isLoading && !error && availability.length > 0 && (
        <div className='space-y-4 max-h-[calc(100vh-18rem)] overflow-y-auto pr-2'>
          {availability.map((day) => {
            const availableSlotsForDay = day.slots.filter((s) => s.available);
            if (availableSlotsForDay.length === 0) return null;

            return (
              <div
                key={day.date + '-general'}
                className='p-3 border rounded-lg bg-gray-50/70'
              >
                <h3 className='text-md font-semibold text-purple-700 mb-2'>
                  {formatDateDisplay(day.date)}
                </h3>
                <ul className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1.5'>
                  {availableSlotsForDay.map((slot) => {
                    const bookingStatus = isGeneralSlotBooked(
                      // Get the status
                      slot.time,
                      day.date,
                      bookings
                    );

                    let slotStyle = 'bg-green-100 text-green-700'; // Default for available

                    if (bookingStatus === 'confirmed') {
                      slotStyle = 'bg-red-200 text-red-700 line-through'; // Confirmed booked
                    } else if (bookingStatus === 'pending_confirmation') {
                      slotStyle = 'bg-yellow-200 text-yellow-700 line-through'; // Pending booked
                    }
                    // 'cancelled' bookings are already filtered out by isGeneralSlotBooked logic if it considers status

                    return (
                      <li
                        key={slot.id || slot.time + '-general'}
                        className={`text-xs p-1.5 rounded text-center ${slotStyle}`}
                      >
                        {slot.time}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
