// src/app/api/bookable-slots/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { MongoClient, ServerApiVersion } from 'mongodb';
import { DayAvailability, Booking } from '@/types';
import { minutesToTime, timeToMinutes } from '@/shared/timeFunctions';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGODB_DB_NAME || 'jessiahs_car_cleaning';
const bookingsCollectionName = 'bookings';
const availabilitiesCollectionName = 'availabilities';

async function getConnectedClient() {
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });
  await client.connect();
  return client;
}

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

  let mongoClient: MongoClient | null = null;
  try {
    mongoClient = await getConnectedClient();
    const db = mongoClient.db(dbName);
    const availabilitiesColl = db.collection<DayAvailability>(
      availabilitiesCollectionName
    );
    const bookingsColl = db.collection<Booking>(bookingsCollectionName);

    const dayAvailability = await availabilitiesColl.findOne({ date });

    if (
      !dayAvailability ||
      !dayAvailability.slots ||
      dayAvailability.slots.length === 0
    ) {
      return NextResponse.json([]); // No admin availability set or no slots for this day
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
    const requiredConsecutiveSlots = 5; // 2hr service (4 slots) + 0.5hr buffer (1 slot)

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
        const bufferEndTimeMinutes = serviceEndTimeMinutes + 30; // Full block including buffer

        let isConflicting = false;
        for (const existingBooking of existingBookingsForDay) {
          const existingBookingStartMinutes = timeToMinutes(
            existingBooking.startTime
          );
          // Assuming existingBooking.endTime is service end, add buffer for full block
          const existingBookingServiceEndMinutes = timeToMinutes(
            existingBooking.endTime
          );
          const existingBookingBufferEndMinutes =
            existingBookingServiceEndMinutes + 30;

          // Check for overlap: (StartA < EndB) AND (EndA > StartB)
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
  } finally {
    if (mongoClient) {
      await mongoClient.close();
    }
  }
}
