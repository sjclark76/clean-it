// src/app/api/admin/bookings/[bookingId]/route.ts
import { NextResponse } from 'next/server';
import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';
import { Booking } from '@/types';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGODB_DB_NAME || 'jessiahs_car_cleaning';
const bookingsCollectionName = 'bookings';
const availabilityCollectionName = 'availability'; // For potential future use

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

interface PatchRequestBody {
  action: 'confirm' | 'cancel';
}

export async function PATCH(
  request: Request,
  { params }: { params: { bookingId: string } }
) {
  let mongoClient: MongoClient | null = null;
  const { bookingId } = params;

  if (!ObjectId.isValid(bookingId)) {
    return NextResponse.json(
      { message: 'Invalid booking ID format' },
      { status: 400 }
    );
  }

  try {
    const body = (await request.json()) as PatchRequestBody;
    const { action } = body;

    if (!action || (action !== 'confirm' && action !== 'cancel')) {
      return NextResponse.json(
        { message: "Invalid action specified. Must be 'confirm' or 'cancel'." },
        { status: 400 }
      );
    }

    mongoClient = await getConnectedClient();
    const db = mongoClient.db(dbName);
    const bookingsColl = db.collection<Booking>(bookingsCollectionName);

    const bookingObjectId = new ObjectId(bookingId);
    const bookingToUpdate = await bookingsColl.findOne({
      _id: bookingObjectId,
    });

    if (!bookingToUpdate) {
      return NextResponse.json(
        { message: 'Booking not found' },
        { status: 404 }
      );
    }

    if (bookingToUpdate.status !== 'pending_confirmation') {
      return NextResponse.json(
        { message: `Booking is already ${bookingToUpdate.status}.` },
        { status: 409 }
      );
    }

    let newStatus: Booking['status'];
    if (action === 'confirm') {
      newStatus = 'confirmed';
    } else {
      // action === 'cancel'
      newStatus = 'cancelled';
    }

    const updateResult = await bookingsColl.updateOne(
      { _id: bookingObjectId },
      { $set: { status: newStatus } }
    );

    if (updateResult.modifiedCount === 0) {
      // This might happen if status was already changed by another process, or no match
      return NextResponse.json(
        {
          message:
            'Booking status not updated. It might have been changed already or booking not found.',
        },
        { status: 409 }
      );
    }

    // Optional: If cancelling, you might want to update general availability.
    // This is complex as it depends on how your general availability slots are structured
    // and whether they directly reflect bookings. For now, we'll skip this.
    // if (newStatus === 'cancelled') {
    //   // Logic to make the time slots available again in the 'availability' collection
    // }

    const updatedBooking = await bookingsColl.findOne({ _id: bookingObjectId });

    return NextResponse.json(
      {
        message: `Booking ${newStatus} successfully.`,
        booking: updatedBooking,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update Booking Status API Error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { message: 'Failed to update booking status', error: errorMessage },
      { status: 500 }
    );
  } finally {
    if (mongoClient) {
      await mongoClient.close();
    }
  }
}
