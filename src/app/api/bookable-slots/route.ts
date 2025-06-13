// src/app/api/bookable-slots/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getBookableSlotsForDateInternal } from '@/lib/slotLogic'; // Import the helper

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');

  if (!date) {
    return NextResponse.json(
      { message: 'Date parameter is required' },
      { status: 400 }
    );
  }

  try {
    const db = await getDb();
    const slots = await getBookableSlotsForDateInternal(db, date);
    return NextResponse.json(slots);
  } catch (error) {
    console.error('Error fetching bookable slots:', error);
    return NextResponse.json(
      {
        message: 'Failed to fetch bookable slots',
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
