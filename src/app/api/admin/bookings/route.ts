// src/app/api/bookings/route.ts
import { NextResponse } from 'next/server';
import { Booking } from '@/types';
import { getDb } from '@/lib/mongodb';
import { withAdminAuth } from '@/lib/withAdminAuth';

const bookingsCollectionName = 'bookings';
async function getBookingHandler() {
  try {
    const db = await getDb(); // Use the shared function
    const bookingsColl = db.collection<Booking>(bookingsCollectionName);

    const todayStr = new Date().toISOString().split('T')[0];

    const upcomingBookings = await bookingsColl
      .find({
        date: { $gte: todayStr },
        status: { $ne: 'cancelled' },
      })
      .sort({ date: 1, startTime: 1 })
      .toArray();

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
  }
}

export const GET = withAdminAuth(getBookingHandler);
