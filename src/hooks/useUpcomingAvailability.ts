// src/hooks/useAdminPageLogic.ts
'use client';

import { useCallback } from 'react';
import { DayAvailability } from '@/types';
import { useSetAtom } from 'jotai';
import {
  availabilityErrorAtom,
  isLoadingAvailabilityAtom,
  upcomingAvailabilityAtom,
} from '@/components/admin/state';

export function useUpcomingAvailability() {
  const setUpcomingAvailability = useSetAtom(upcomingAvailabilityAtom);
  const setIsLoadingAvailability = useSetAtom(isLoadingAvailabilityAtom);
  const setAvailabilityError = useSetAtom(availabilityErrorAtom);

  return useCallback(async () => {
    setIsLoadingAvailability(true);
    setAvailabilityError(null);
    try {
      const response = await fetch('/api/admin/availability');
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: 'Failed to fetch upcoming availability' }));
        throw new Error(
          errorData.message || 'Failed to fetch upcoming availability'
        );
      }
      const data: DayAvailability[] = await response.json();
      const todayStr = new Date().toISOString().split('T')[0];
      setUpcomingAvailability(
        data
          .filter((day) => day.date >= todayStr)
          .sort((a, b) => a.date.localeCompare(b.date))
      );
    } catch (err) {
      setAvailabilityError(
        err instanceof Error ? err.message : 'An unknown error occurred'
      );
    } finally {
      setIsLoadingAvailability(false);
    }
  }, [setAvailabilityError, setIsLoadingAvailability, setUpcomingAvailability]);
}
