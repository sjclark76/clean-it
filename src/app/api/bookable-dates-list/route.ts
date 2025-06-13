// src/app/api/bookable-dates-list/route.ts
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { DayAvailability } from '@/types';
import { getBookableSlotsForDateInternal } from '@/lib/slotLogic'; // Reusing the helper

export async function GET() {
  try {
    const db = await getDb();
    const availabilitiesColl = db.collection<DayAvailability>('availabilities');

    const todayStr = new Date().toISOString().split('T')[0];
    // Fetch all days where admin has set *any* general availability from today onwards
    const allAdminSetDays = await availabilitiesColl
      .find({
        date: { $gte: todayStr },
        'slots.0': { $exists: true }, // Ensure slots array is not empty
      })
      .sort({ date: 1 })
      .toArray();

    const datesWithActualSlots: DayAvailability[] = [];

    for (const day of allAdminSetDays) {
      // First, quickly check if the admin marked *any* slot as available for this day
      if (day.slots.some((s) => s.available)) {
        // Then, perform the more intensive check for actual bookable 2.5hr blocks
        const bookableSlots = await getBookableSlotsForDateInternal(
          db,
          day.date
        );
        if (bookableSlots.length > 0) {
          // We return the DayAvailability object so frontend can use day.date for value and formatDateDisplay
          datesWithActualSlots.push(day);
        }
      }
    }
    return NextResponse.json(datesWithActualSlots);
  } catch (error) {
    console.error('Error fetching bookable dates list:', error);
    return NextResponse.json(
      {
        message: 'Failed to fetch list of bookable dates',
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
