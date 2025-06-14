import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { Booking, DayAvailability } from '@/types';
import { minutesToTime, timeToMinutes } from '@/shared/timeFunctions';

const bookingsCollectionName = 'bookings';
const availabilitiesCollectionName = 'availabilities';

export async function POST(request: NextRequest) {
  try {
    const bookingData = await request.json();

    if (
      !bookingData.date ||
      !bookingData.startTime ||
      !bookingData.clientName ||
      !bookingData.clientEmail ||
      !bookingData.clientPhone
    ) {
      return NextResponse.json(
        { message: 'Missing required booking fields' },
        { status: 400 }
      );
    }

    const db = await getDb(); // Use the shared function
    const bookingsColl = db.collection<Booking>(bookingsCollectionName);
    const availabilitiesColl = db.collection<DayAvailability>(
      availabilitiesCollectionName
    );

    const serviceStartTimeMinutes = timeToMinutes(bookingData.startTime);
    const serviceEndTimeMinutes = serviceStartTimeMinutes + 120; // 2 hours service
    const bufferEndTimeMinutes = serviceEndTimeMinutes + 30; // 30 min buffer

    const newBookingDraft: Omit<Booking, '_id' | 'createdAt' | 'status'> & {
      status: 'pending_confirmation';
      createdAt: Date;
    } = {
      date: bookingData.date,
      startTime: bookingData.startTime,
      endTime: minutesToTime(serviceEndTimeMinutes), // Service end time
      clientName: bookingData.clientName,
      clientEmail: bookingData.clientEmail,
      clientPhone: bookingData.clientPhone,
      notes: bookingData.notes || '',
      status: 'pending_confirmation',
      createdAt: new Date(),
    };

    // 1. Check if the admin has marked these underlying half-hour slots as generally available
    const dayAvailability = await availabilitiesColl.findOne({
      date: bookingData.date,
    });
    if (!dayAvailability) {
      return NextResponse.json(
        { message: 'Availability for this date not found.' },
        { status: 404 }
      );
    }

    const requiredSlotsForBlock: string[] = [];
    for (let i = 0; i < 5; i++) {
      requiredSlotsForBlock.push(
        minutesToTime(serviceStartTimeMinutes + i * 30)
      );
    }

    const adminHasMadeSlotsAvailable = requiredSlotsForBlock.every(
      (blockTime) => {
        const slot = dayAvailability.slots.find((s) => s.time === blockTime);
        return slot && slot.available;
      }
    );

    if (!adminHasMadeSlotsAvailable) {
      return NextResponse.json(
        {
          message:
            'The selected time slot is not generally available by the admin. Please choose another time.',
        },
        { status: 409 }
      );
    }

    // 2. Check for conflicts with existing non-cancelled bookings
    const newBookingBlockStartMinutes = serviceStartTimeMinutes;
    const newBookingBlockEndMinutes = bufferEndTimeMinutes;

    const conflictingBookings = await bookingsColl
      .find({
        date: newBookingDraft.date,
        status: { $ne: 'cancelled' },
      })
      .toArray();

    for (const existingBooking of conflictingBookings) {
      const existingBookingStartMinutes = timeToMinutes(
        existingBooking.startTime
      );
      const existingBookingBlockEndMinutes =
        timeToMinutes(existingBooking.endTime) + 30;

      if (
        newBookingBlockStartMinutes < existingBookingBlockEndMinutes &&
        newBookingBlockEndMinutes > existingBookingStartMinutes
      ) {
        return NextResponse.json(
          {
            message:
              'The selected time slot conflicts with an existing booking. Please choose another time.',
          },
          { status: 409 }
        );
      }
    }

    const bookingResult = await bookingsColl.insertOne(
      newBookingDraft as Booking
    );

    return NextResponse.json(
      {
        message: 'Booking request received successfully!',
        bookingId: bookingResult.insertedId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Booking API Error:', error);
    return NextResponse.json(
      {
        message: 'Failed to process booking request',
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
  // No finally block needed here to close client, as it's managed by the utility
}
