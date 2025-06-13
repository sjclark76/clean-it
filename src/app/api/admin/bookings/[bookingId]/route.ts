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

    const bookingToUpdateOrDelete = await bookingsColl.findOne({
      _id: objectId, // Use ObjectId instance here
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
          booking: updatedBooking, // Return the updated booking for confirmation
        },
        { status: 200 }
      );
    } else {
      // action === 'cancel'
      // Allow cancellation (deletion) for 'pending_confirmation' or 'confirmed'
      if (
        bookingToUpdateOrDelete.status !== 'pending_confirmation' &&
        bookingToUpdateOrDelete.status !== 'confirmed'
      ) {
        // If already cancelled or in another state not allowing cancellation,
        // you might want to return an error or just state it cannot be deleted.
        // For simplicity, if it's already 'cancelled', deleting it is fine.
        // If it's in a state that shouldn't be deleted, this check is important.
        if (bookingToUpdateOrDelete.status === 'cancelled') {
          // If you want to prevent deleting already "logically" cancelled bookings:
          // return NextResponse.json(
          //   { message: 'Booking was already cancelled and will now be deleted.' },
          //   { status: 200 } // Or 409 if you want to prevent re-action
          // );
        } else {
          return NextResponse.json(
            {
              message: `Cannot delete booking with status: ${bookingToUpdateOrDelete.status}. Only pending or confirmed bookings can be deleted.`,
            },
            { status: 409 }
          );
        }
      }

      const deleteResult = await bookingsColl.deleteOne({ _id: objectId });

      if (deleteResult.deletedCount === 0) {
        return NextResponse.json(
          {
            message:
              'Booking not deleted. It might have been deleted concurrently or an issue occurred.',
          },
          { status: 404 } // Or 409 if you prefer
        );
      }

      return NextResponse.json(
        {
          message: `Booking cancelled and deleted successfully.`,
          // No booking object to return as it's deleted
        },
        { status: 200 } // 200 OK or 204 No Content are both suitable
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
