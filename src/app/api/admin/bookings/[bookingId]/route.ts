// src/app/api/admin/bookings/[bookingId]/route.ts
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { Booking } from '@/types';
import { getDb } from '@/lib/mongodb';

const bookingsCollectionName = 'bookings';

interface PatchRequestBody {
  action: 'confirm' | 'cancel';
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  const { bookingId } = await params;

  if (!ObjectId.isValid(bookingId)) {
    return NextResponse.json(
      { message: 'Invalid booking ID format' },
      { status: 400 }
    );
  }

  const objectId = new ObjectId(bookingId); // Convert string to ObjectId

  try {
    const body = (await request.json()) as PatchRequestBody;
    const { action } = body;

    if (!action || (action !== 'confirm' && action !== 'cancel')) {
      return NextResponse.json(
        { message: "Invalid action specified. Must be 'confirm' or 'cancel'." },
        { status: 400 }
      );
    }

    const db = await getDb();
    const bookingsColl = db.collection<Booking>(bookingsCollectionName);

    const bookingToUpdate = await bookingsColl.findOne({
      _id: objectId, // Use ObjectId instance here
    });

    if (!bookingToUpdate) {
      return NextResponse.json(
        { message: 'Booking not found' },
        { status: 404 }
      );
    }

    let newStatus: Booking['status'];

    if (action === 'confirm') {
      if (bookingToUpdate.status !== 'pending_confirmation') {
        return NextResponse.json(
          {
            message: `Booking is already ${bookingToUpdate.status}. Only pending bookings can be confirmed.`,
          },
          { status: 409 }
        );
      }
      newStatus = 'confirmed';
    } else {
      // action === 'cancel'
      if (bookingToUpdate.status === 'cancelled') {
        return NextResponse.json(
          { message: 'Booking is already cancelled.' },
          { status: 409 }
        );
      }
      // Allow cancellation for 'pending_confirmation' or 'confirmed'
      if (
        bookingToUpdate.status !== 'pending_confirmation' &&
        bookingToUpdate.status !== 'confirmed'
      ) {
        return NextResponse.json(
          {
            message: `Cannot cancel booking with status: ${bookingToUpdate.status}.`,
          },
          { status: 409 }
        );
      }
      newStatus = 'cancelled';
    }

    const updateResult = await bookingsColl.updateOne(
      { _id: objectId }, // Use ObjectId instance here
      { $set: { status: newStatus } }
    );

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json(
        {
          message:
            'Booking status not updated. It might have been changed concurrently or an issue occurred.',
        },
        { status: 409 }
      );
    }

    const updatedBooking = await bookingsColl.findOne({
      _id: objectId, // Use ObjectId instance here
    });

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
  }
}
