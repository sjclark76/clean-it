// Example: src/app/api/admin/bookings/[bookingId]/route.ts
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { Booking } from '@/types';
import { getDb } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Import getServerSession

const bookingsCollectionName = 'bookings';

interface PatchRequestBody {
  action: 'confirm' | 'cancel';
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  // --- Add this session check ---
  const session = await getServerSession(authOptions);

  if (!session) {
    // If no session, return unauthorized
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  // --- End session check ---

  const { bookingId } = await params;

  if (!ObjectId.isValid(bookingId)) {
    return NextResponse.json(
      { message: 'Invalid booking ID format' },
      { status: 400 }
    );
  }

  const objectId = new ObjectId(bookingId);

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

    const bookingToUpdateOrDelete = await bookingsColl.findOne({
      _id: objectId,
    });

    if (!bookingToUpdateOrDelete) {
      return NextResponse.json(
        { message: 'Booking not found' },
        { status: 404 }
      );
    }

    if (action === 'confirm') {
      if (bookingToUpdateOrDelete.status !== 'pending_confirmation') {
        return NextResponse.json(
          {
            message: `Booking is already ${bookingToUpdateOrDelete.status}. Only pending bookings can be confirmed.`,
          },
          { status: 409 }
        );
      }
      const newStatus = 'confirmed';
      const updateResult = await bookingsColl.updateOne(
        { _id: objectId },
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
        _id: objectId,
      });

      return NextResponse.json(
        {
          message: `Booking ${newStatus} successfully.`,
          booking: updatedBooking,
        },
        { status: 200 }
      );
    } else {
      // action === 'cancel'
      if (
        bookingToUpdateOrDelete.status !== 'pending_confirmation' &&
        bookingToUpdateOrDelete.status !== 'confirmed' &&
        bookingToUpdateOrDelete.status !== 'cancelled' // Allow deleting already cancelled ones
      ) {
        return NextResponse.json(
          {
            message: `Cannot delete booking with status: ${bookingToUpdateOrDelete.status}. Only pending, confirmed, or already cancelled bookings can be deleted.`,
          },
          { status: 409 }
        );
      }

      const deleteResult = await bookingsColl.deleteOne({ _id: objectId });

      if (deleteResult.deletedCount === 0) {
        return NextResponse.json(
          {
            message:
              'Booking not deleted. It might have been deleted concurrently or an issue occurred.',
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          message: `Booking cancelled and deleted successfully.`,
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Update/Delete Booking API Error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { message: 'Failed to process booking request', error: errorMessage },
      { status: 500 }
    );
  }
}
