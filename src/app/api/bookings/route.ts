// src/app/api/bookings/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { MongoClient, ServerApiVersion } from 'mongodb';
import { Booking, DayAvailability } from '@/types';
import { minutesToTime, timeToMinutes } from '@/shared/timeFunctions';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGODB_DB_NAME || 'jessiahs_car_cleaning';
const bookingsCollectionName = 'bookings';
const availabilitiesCollectionName = 'availabilities'; // To update admin's slots

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

export async function POST(request: NextRequest) {
  let mongoClient: MongoClient | null = null;
  try {
    const bookingData = await request.json();

    // Basic Validation
    if (
      !bookingData.date ||
      !bookingData.startTime ||
      !bookingData.clientName ||
      !bookingData.clientEmail ||
      !bookingData.clientPhone ||
      !bookingData.serviceType
    ) {
      return NextResponse.json(
        { message: 'Missing required booking fields' },
        { status: 400 }
      );
    }

    mongoClient = await getConnectedClient();
    const db = mongoClient.db(dbName);
    const bookingsColl = db.collection<Booking>(bookingsCollectionName);
    const availabilitiesColl = db.collection<DayAvailability>(
      availabilitiesCollectionName
    );

    // 1. Prepare the new booking document
    const serviceStartTimeMinutes = timeToMinutes(bookingData.startTime);
    const serviceEndTimeMinutes = serviceStartTimeMinutes + 120; // 2 hours

    const newBooking: Omit<Booking, '_id' | 'createdAt' | 'status'> & {
      status: 'pending_confirmation';
      createdAt: Date;
    } = {
      date: bookingData.date,
      startTime: bookingData.startTime,
      endTime: minutesToTime(serviceEndTimeMinutes),
      clientName: bookingData.clientName,
      clientEmail: bookingData.clientEmail,
      clientPhone: bookingData.clientPhone,
      serviceType: bookingData.serviceType,
      notes: bookingData.notes || '',
      status: 'pending_confirmation',
      createdAt: new Date(),
    };

    // 2. Check if the slots are still available (important for concurrency)
    // This is a simplified check. For true atomicity, transactions are needed.
    const dayAvailability = await availabilitiesColl.findOne({
      date: bookingData.date,
    });
    if (!dayAvailability) {
      return NextResponse.json(
        { message: 'Availability for this date not found.' },
        { status: 404 }
      );
    }

    const slotsToBlockTimes: string[] = [];
    for (let i = 0; i < 5; i++) {
      // 4 for service, 1 for buffer = 5 half-hour slots
      slotsToBlockTimes.push(minutesToTime(serviceStartTimeMinutes + i * 30));
    }

    const stillAvailable = slotsToBlockTimes.every((blockTime) => {
      const slot = dayAvailability.slots.find((s) => s.time === blockTime);
      return slot && slot.available;
    });

    if (!stillAvailable) {
      return NextResponse.json(
        {
          message:
            'The selected time slot is no longer available. Please choose another time.',
        },
        { status: 409 }
      ); // 409 Conflict
    }

    // 3. Insert the booking
    const bookingResult = await bookingsColl.insertOne(newBooking as Booking);

    // 4. Update the admin's availability slots
    // Mark the 5 half-hour slots (2hr service + 0.5hr buffer) as unavailable
    const updateResult = await availabilitiesColl.updateOne(
      { date: bookingData.date },
      { $set: { 'slots.$[elem].available': false } },
      { arrayFilters: [{ 'elem.time': { $in: slotsToBlockTimes } }] }
    );

    if (updateResult.modifiedCount === 0 && updateResult.matchedCount > 0) {
      // This might happen if somehow the slots were already marked unavailable by another process
      // but the initial check passed. Log this for investigation.
      console.warn(
        `Availability slots for booking ${bookingResult.insertedId} on ${bookingData.date} at ${bookingData.startTime} were not updated, though a match was found.`
      );
    } else if (updateResult.matchedCount === 0) {
      console.error(
        `Failed to find availability document to update for date: ${bookingData.date} after booking ${bookingResult.insertedId}`
      );
      // Potentially roll back booking or notify admin
    }

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
  } finally {
    if (mongoClient) {
      await mongoClient.close();
    }
  }
}

export async function GET() {
  let mongoClient: MongoClient | null = null;
  try {
    mongoClient = await getConnectedClient();
    const db = mongoClient.db(dbName);
    const bookingsColl = db.collection<Booking>(bookingsCollectionName);

    const todayStr = new Date().toISOString().split('T')[0];

    // Fetch bookings that are today or in the future, and not cancelled
    const upcomingBookings = await bookingsColl
      .find({
        date: { $gte: todayStr },
        status: { $ne: 'cancelled' }, // Optionally filter out cancelled bookings
      })
      .sort({ date: 1, startTime: 1 })
      .toArray(); // Sort by date then start time

    return NextResponse.json(upcomingBookings);
  } catch (error) {
    console.error('Failed to fetch bookings:', error);
    return NextResponse.json(
      {
        message: 'Failed to retrieve bookings',
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
