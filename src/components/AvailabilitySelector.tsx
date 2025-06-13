// src/components/AvailabilitySelector.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DayAvailability } from '@/types';

interface BookableSlot {
  startTime: string;
  displayTime: string;
}

interface AvailabilitySelectorProps {
  onSlotSelect: (date: string, startTime: string) => void;
}

export default function AvailabilitySelector({
  onSlotSelect,
}: AvailabilitySelectorProps) {
  const [adminDates, setAdminDates] = useState<DayAvailability[]>([]); // Will hold dates that have bookable slots
  const [bookableSlotsForSelectedDate, setBookableSlotsForSelectedDate] =
    useState<BookableSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedBookableSlotTime, setSelectedBookableSlotTime] = useState<
    string | null
  >(null);
  const [isLoadingDates, setIsLoadingDates] = useState<boolean>(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookableAdminDates = async () => {
      setIsLoadingDates(true);
      setError(null);
      try {
        // Call the new endpoint
        const response = await fetch('/api/bookable-dates-list');
        if (!response.ok)
          throw new Error('Failed to fetch bookable admin dates');
        const data: DayAvailability[] = await response.json();
        setAdminDates(data);

        // Optionally, auto-select the first date if available
        // if (data.length > 0) {
        //   setSelectedDate(data[0].date);
        // }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Unknown error fetching dates'
        );
      } finally {
        setIsLoadingDates(false);
      }
    };
    fetchBookableAdminDates();
  }, []);

  const fetchBookableSlotsForDate = useCallback(async (date: string) => {
    if (!date) return;
    setIsLoadingSlots(true);
    setBookableSlotsForSelectedDate([]);
    setSelectedBookableSlotTime(null);
    setError(null); // Clear general error when fetching slots for a specific date
    try {
      const response = await fetch(`/api/bookable-slots?date=${date}`);
      if (!response.ok)
        throw new Error(`Failed to fetch bookable slots for ${date}`);
      const data: BookableSlot[] = await response.json();
      setBookableSlotsForSelectedDate(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : `Error fetching slots for ${date}`
      );
    } finally {
      setIsLoadingSlots(false);
    }
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchBookableSlotsForDate(selectedDate);
    } else {
      setBookableSlotsForSelectedDate([]);
    }
  }, [selectedDate, fetchBookableSlotsForDate]);

  const handleDateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDate(event.target.value);
  };

  const handleTimeSlotClick = (slot: BookableSlot) => {
    if (selectedDate) {
      setSelectedBookableSlotTime(slot.startTime);
      onSlotSelect(selectedDate, slot.startTime);
    } else {
      console.error('Date not selected, cannot select time slot.');
    }
  };

  const formatDateDisplay = (dateString: string) => {
    const dateObj = new Date(dateString + 'T00:00:00');
    return dateObj.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoadingDates) {
    return (
      <div className='p-4 text-center text-gray-600'>
        Loading available dates...
      </div>
    );
  }

  // Show general error if it occurred during date loading and we are not currently loading slots
  if (error && !isLoadingSlots && !selectedDate) {
    return <div className='p-4 text-center text-red-600'>Error: {error}</div>;
  }

  if (adminDates.length === 0 && !isLoadingDates) {
    return (
      <div className='p-4 text-center text-gray-600'>
        No dates with available booking slots found at this time.
      </div>
    );
  }

  return (
    <div className='p-4 border border-gray-300 rounded-md bg-gray-50'>
      <h3 className='text-lg font-semibold text-gray-700 mb-4'>
        Select a 2-Hour Service Slot
      </h3>
      <p className='text-xs text-gray-500 mb-4'>
        A 30-minute buffer is automatically included after each service.
      </p>

      <div className='mb-6'>
        <label
          htmlFor='date-select'
          className='block text-sm font-medium text-gray-700 mb-1'
        >
          Choose a Date:
        </label>
        <select
          id='date-select'
          value={selectedDate || ''}
          onChange={handleDateChange}
          className='w-full bg-white border-gray-300 text-gray-900 rounded-md p-3 focus:ring-purple-500 focus:border-purple-500'
          disabled={adminDates.length === 0}
        >
          <option value='' disabled>
            {adminDates.length === 0 ? 'No dates available' : 'Select a date'}
          </option>
          {adminDates.map((day) => (
            <option key={day.date} value={day.date}>
              {formatDateDisplay(day.date)}
            </option>
          ))}
        </select>
      </div>

      {isLoadingSlots && (
        <div className='p-4 text-center text-gray-600'>
          Loading available slots for{' '}
          {selectedDate ? formatDateDisplay(selectedDate) : ''}...
        </div>
      )}

      {/* Display error related to slot fetching only when slots are being loaded or have failed for a selected date */}
      {selectedDate && error && !isLoadingSlots && (
        <div className='p-4 text-center text-red-600'>
          Error loading slots: {error}
        </div>
      )}

      {!isLoadingSlots &&
        selectedDate &&
        bookableSlotsForSelectedDate.length > 0 && (
          <div>
            <h4 className='text-md font-medium text-gray-700 mb-3'>
              Available 2-hour slots for {formatDateDisplay(selectedDate)}:
            </h4>
            <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
              {bookableSlotsForSelectedDate.map((slot, index) => (
                <button
                  key={`${selectedDate}-${slot.startTime}-${index}`}
                  type='button'
                  onClick={() => handleTimeSlotClick(slot)}
                  className={`
                  p-3 rounded-md text-sm font-medium border transition-all
                  ${
                    selectedBookableSlotTime === slot.startTime
                      ? 'bg-purple-600 text-white border-purple-600 ring-2 ring-purple-500 ring-offset-1'
                      : 'bg-white text-purple-700 border-purple-300 hover:bg-purple-100 hover:border-purple-500'
                  }
                `}
                >
                  {slot.displayTime}
                </button>
              ))}
            </div>
          </div>
        )}

      {!isLoadingSlots &&
        selectedDate &&
        bookableSlotsForSelectedDate.length === 0 &&
        !error && ( // Only show "no slots" if there wasn't an error loading them
          <p className='text-gray-500 text-sm mt-3'>
            No 2-hour slots available for this day.
          </p>
        )}
    </div>
  );
}
