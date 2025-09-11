// src/lib/slotLogic.ts
import { Db } from 'mongodb';
import { DayAvailability, Booking } from '@/types';
import { minutesToTime, timeToMinutes } from '@/shared/timeFunctions';

interface BookableSlotItem {
  startTime: string;
  displayTime: string;
}

export async function getBookableSlotsForDateInternal(
  db: Db,
  date: string
): Promise<BookableSlotItem[]> {
  const availabilitiesColl = db.collection<DayAvailability>('availabilities');
  const bookingsColl = db.collection<Booking>('bookings');

  const dayAvailability = await availabilitiesColl.findOne({ date });
  if (
    !dayAvailability ||
    !dayAvailability.slots ||
    dayAvailability.slots.length === 0
  ) {
    return [];
  }

  const existingBookingsForDay = await bookingsColl
    .find({
      date: date,
      status: { $ne: 'cancelled' },
    })
    .toArray();

  const bookableSlots: BookableSlotItem[] = [];
  const sortedAdminSlots = [...dayAvailability.slots].sort(
    (a, b) => timeToMinutes(a.time) - timeToMinutes(b.time)
  );
  const requiredConsecutiveSlots = 4; // 2hr service (4 slots)

  for (
    let i = 0;
    i <= sortedAdminSlots.length - requiredConsecutiveSlots;
    i++
  ) {
    let isAdminSlotBlockAvailable = true;
    for (let j = 0; j < requiredConsecutiveSlots; j++) {
      if (!sortedAdminSlots[i + j] || !sortedAdminSlots[i + j].available) {
        isAdminSlotBlockAvailable = false;
        break;
      }
    }

    if (isAdminSlotBlockAvailable) {
      const potentialStartTimeStr = sortedAdminSlots[i].time;
      const potentialStartTimeMinutes = timeToMinutes(potentialStartTimeStr);
      const serviceEndTimeMinutes = potentialStartTimeMinutes + 120; // 2 hours
      const bufferEndTimeMinutes = serviceEndTimeMinutes + 30; // Full block

      let isConflicting = false;
      for (const existingBooking of existingBookingsForDay) {
        const existingBookingStartMinutes = timeToMinutes(
          existingBooking.startTime
        );
        const existingBookingServiceEndMinutes = timeToMinutes(
          existingBooking.endTime
        );
        const existingBookingBufferEndMinutes =
          existingBookingServiceEndMinutes + 30;

        if (
          potentialStartTimeMinutes < existingBookingBufferEndMinutes &&
          bufferEndTimeMinutes > existingBookingStartMinutes
        ) {
          isConflicting = true;
          break;
        }
      }

      if (!isConflicting) {
        const serviceEndTimeStr = minutesToTime(serviceEndTimeMinutes);
        bookableSlots.push({
          startTime: potentialStartTimeStr,
          displayTime: `${potentialStartTimeStr} - ${serviceEndTimeStr}`,
        });
      }
    }
  }
  return bookableSlots;
}
