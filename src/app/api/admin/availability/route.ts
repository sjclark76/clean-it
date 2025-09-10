// src/app/api/availability/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { UpdateResult } from 'mongodb';
import { getDb } from '@/lib/mongodb';
import { withAdminAuth } from '@/lib/withAdminAuth';

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

interface DayAvailability {
  _id?: string;
  date: string;
  dayName: string;
  slots: TimeSlot[];
}

const collectionName = 'availabilities';

async function getAvailabilityHandler() {
  try {
    const db = await getDb(); // Use the shared function
    console.log(
      'GET Availability: Successfully connected to MongoDB via getDb.'
    );
    const availabilitiesCollection =
      db.collection<DayAvailability>(collectionName);
    const availabilities = await availabilitiesCollection
      .find({})
      .sort({ date: 1 })
      .toArray();
    return NextResponse.json(availabilities);
  } catch (error) {
    console.error(
      'GET Availability: Failed to connect to MongoDB or fetch data:',
      error
    );
    return NextResponse.json(
      {
        message: 'Failed to retrieve availability data',
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

async function createAvailabilityHandler(request: NextRequest) {
  try {
    const newAvailability: DayAvailability = await request.json();

    if (
      !newAvailability.date ||
      !newAvailability.dayName ||
      !newAvailability.slots
    ) {
      return NextResponse.json(
        { message: 'Missing required fields (date, dayName, slots)' },
        { status: 400 }
      );
    }

    const db = await getDb(); // Use the shared function
    console.log(
      'POST Availability: Successfully connected to MongoDB via getDb.'
    );
    const availabilitiesCollection =
      db.collection<DayAvailability>(collectionName);

    const result: UpdateResult = await availabilitiesCollection.updateOne(
      { date: newAvailability.date },
      {
        $set: {
          dayName: newAvailability.dayName,
          slots: newAvailability.slots,
          date: newAvailability.date,
        },
      },
      { upsert: true }
    );

    if (result.upsertedCount > 0) {
      return NextResponse.json(
        { message: 'Availability created successfully', id: result.upsertedId },
        { status: 201 }
      );
    } else if (result.modifiedCount > 0) {
      return NextResponse.json(
        { message: 'Availability updated successfully' },
        { status: 200 }
      );
    } else if (result.matchedCount > 0 && result.modifiedCount === 0) {
      return NextResponse.json(
        { message: 'Availability already up-to-date' },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          message: 'Failed to update or create availability, no changes made.',
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('POST Availability: Failed to process availability:', error);
    return NextResponse.json(
      {
        message: 'Failed to process availability',
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

export const GET = getAvailabilityHandler;
export const POST = withAdminAuth(createAvailabilityHandler);
