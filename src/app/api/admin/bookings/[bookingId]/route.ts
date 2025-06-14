// src/app/api/admin/bookings/[bookingId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { Booking } from '@/types';
import { getDb } from '@/lib/mongodb';
import { withAdminAuth } from '@/lib/withAdminAuth';
import { Session as NextAuthSession } from 'next-auth';

const bookingsCollectionName = 'bookings';

interface PatchRequestBody {
  action: 'confirm' | 'cancel';
}

// Define the specific shape of params for this route
interface BookingIdParams {
  bookingId: string;
}

// Updated handler signature
async function patchBookingHandler(
  request: NextRequest,
  context: { params: BookingIdParams; session: NextAuthSession } // Context now clearly typed
) {
  const { bookingId } = context.params; // Access params from context
  // const session = context.session; // Session is available if needed

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
      const updatedBooking = await bookingsColl.findOne({ _id: objectId });
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
        bookingToUpdateOrDelete.status !== 'cancelled'
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
        { message: 'Booking cancelled and deleted successfully.' },
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

// Explicitly provide the generic type for params to withAdminAuth
export const PATCH = withAdminAuth<BookingIdParams>(patchBookingHandler);
