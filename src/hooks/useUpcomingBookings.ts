// src/hooks/useAdminPageLogic.ts
'use client';

import { useCallback } from 'react';
import { Booking } from '@/types';
import { timeToMinutes } from '@/shared/timeFunctions';
import { useSetAtom } from 'jotai';
import {
  bookingsErrorAtom,
  isLoadingBookingsAtom,
  upcomingBookingsAtom,
} from '@/components/admin/state';

export function useUpcomingBookings() {
  const setUpcomingBookings = useSetAtom(upcomingBookingsAtom);
  const setIsLoadingBookings = useSetAtom(isLoadingBookingsAtom);
  const setBookingsError = useSetAtom(bookingsErrorAtom);

  return useCallback(async () => {
    setIsLoadingBookings(true);
    setBookingsError(null);
    try {
      const response = await fetch('/api/admin/bookings');
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: 'Failed to fetch upcoming bookings' }));
        throw new Error(
          errorData.message || 'Failed to fetch upcoming bookings'
        );
      }
      const data: Booking[] = await response.json();
      const sortedBookings = data.sort((a, b) => {
        const dateComparison = a.date.localeCompare(b.date);
        if (dateComparison !== 0) return dateComparison;
        return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
      });
      setUpcomingBookings(sortedBookings);
    } catch (err) {
      setBookingsError(
        err instanceof Error ? err.message : 'An unknown error occurred'
      );
    } finally {
      setIsLoadingBookings(false);
    }
  }, [setBookingsError, setIsLoadingBookings, setUpcomingBookings]);
}
