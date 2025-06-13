// src/app/api/bookable-slots/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { DayAvailability, Booking } from '@/types';
import { minutesToTime, timeToMinutes } from '@/shared/timeFunctions';
import { getDb } from '@/lib/mongodb'; // Import the shared utility

const bookingsCollectionName = 'bookings';
const availabilitiesCollectionName = 'availabilities';

interface BookableSlotResponseItem {
  startTime: string;
  displayTime: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');

  if (!date) {
    return NextResponse.json(
      { message: 'Date parameter is required' },
      { status: 400 }
    );
  }

  try {
    const db = await getDb(); // Use the shared function
    const availabilitiesColl = db.collection<DayAvailability>(
      availabilitiesCollectionName
    );
    const bookingsColl = db.collection<Booking>(bookingsCollectionName);

    // ... (rest of your logic remains the same) ...

    const dayAvailability = await availabilitiesColl.findOne({ date });

    if (
      !dayAvailability ||
      !dayAvailability.slots ||
      dayAvailability.slots.length === 0
    ) {
      return NextResponse.json([]);
    }

    const existingBookingsForDay = await bookingsColl
      .find({
        date: date,
        status: { $ne: 'cancelled' },
      })
      .toArray();

    const bookableSlots: BookableSlotResponseItem[] = [];
    const sortedAdminSlots = [...dayAvailability.slots].sort(
      (a, b) => timeToMinutes(a.time) - timeToMinutes(b.time)
    );
    const requiredConsecutiveSlots = 5;

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
        const serviceEndTimeMinutes = potentialStartTimeMinutes + 120;
        const bufferEndTimeMinutes = serviceEndTimeMinutes + 30;

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
    return NextResponse.json(bookableSlots);
  } catch (error) {
    console.error('Error fetching bookable slots:', error);
    return NextResponse.json(
      {
        message: 'Failed to fetch bookable slots',
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
