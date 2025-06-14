// src/app/api/bookings/route.ts
import { NextResponse } from 'next/server';
import { Booking } from '@/types';
import { getDb } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Import the shared utility

const bookingsCollectionName = 'bookings';

export async function GET() {
  // --- Add this session check ---
  const session = await getServerSession(authOptions);

  if (!session) {
    // If no session, return unauthorized
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  // --- End session check ---

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
