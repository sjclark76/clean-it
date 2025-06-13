// src/components/AvailabilitySelector.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
// minutesToTime and timeToMinutes are no longer needed here as logic moved to backend
import { DayAvailability } from '@/types'; // Keep DayAvailability for admin dates

// This interface now matches the API response for bookable slots
interface BookableSlot {
  // date is implicit from the selectedDate state
  startTime: string; // e.g., "09:00 AM" - this is what the user picks
  displayTime: string; // e.g., "09:00 AM - 11:00 AM"
}

interface AvailabilitySelectorProps {
  onSlotSelect: (date: string, startTime: string) => void;
}

export default function AvailabilitySelector({
  onSlotSelect,
}: AvailabilitySelectorProps) {
  // adminAvailability is now only for populating the date dropdown
  const [adminDates, setAdminDates] = useState<DayAvailability[]>([]);
  const [bookableSlotsForSelectedDate, setBookableSlotsForSelectedDate] =
    useState<BookableSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedBookableSlotTime, setSelectedBookableSlotTime] = useState<
    string | null
  >(null);
  const [isLoadingDates, setIsLoadingDates] = useState<boolean>(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false); // Separate loading for slots
  const [error, setError] = useState<string | null>(null);

  // Fetch admin-set available dates to populate the dropdown
  useEffect(() => {
    const fetchAdminAvailableDates = async () => {
      setIsLoadingDates(true);
      setError(null);
      try {
        const response = await fetch('/api/availability'); // Fetches all admin availability
        if (!response.ok)
          throw new Error('Failed to fetch admin available dates');
        const data: DayAvailability[] = await response.json();
        // Filter out dates that have no available slots at all, if desired, or do it on backend
        const datesWithSomeAvailability = data.filter((day) =>
          day.slots.some((s) => s.available)
        );
        setAdminDates(datesWithSomeAvailability);

        // Optionally, pre-select the first available date
        if (datesWithSomeAvailability.length > 0) {
          // To pre-select and fetch slots, you'd call fetchBookableSlotsForDate here
          // For simplicity, we'll let the user pick a date first.
          // Or, if you want to auto-select the first date and load its slots:
          // const firstDate = datesWithSomeAvailability[0].date;
          // setSelectedDate(firstDate);
          // fetchBookableSlotsForDate(firstDate); // You'd need to define this function
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Unknown error fetching dates'
        );
      } finally {
        setIsLoadingDates(false);
      }
    };
    fetchAdminAvailableDates();
  }, []);

  // Fetch bookable slots when a date is selected
  const fetchBookableSlotsForDate = useCallback(async (date: string) => {
    if (!date) return;
    setIsLoadingSlots(true);
    setBookableSlotsForSelectedDate([]); // Clear previous slots
    setSelectedBookableSlotTime(null); // Reset selection
    setError(null);
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
      setBookableSlotsForSelectedDate([]); // Clear slots if no date is selected
    }
  }, [selectedDate, fetchBookableSlotsForDate]);

  const handleDateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDate(event.target.value);
  };

  const handleTimeSlotClick = (slot: BookableSlot) => {
    if (selectedDate) {
      // Ensure selectedDate is not null
      setSelectedBookableSlotTime(slot.startTime);
      onSlotSelect(selectedDate, slot.startTime);
    } else {
      console.error('Date not selected, cannot select time slot.');
      // Optionally, set an error message for the user
    }
  };

  const formatDateDisplay = (dateString: string) => {
    const dateObj = new Date(dateString + 'T00:00:00'); // Treat as local
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

  if (error && !isLoadingSlots) {
    // Show general error if not specifically loading slots
    return <div className='p-4 text-center text-red-600'>Error: {error}</div>;
  }

  if (adminDates.length === 0 && !isLoadingDates) {
    return (
      <div className='p-4 text-center text-gray-600'>
        No dates with general availability found.
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

      {error &&
        isLoadingSlots && ( // Show error specific to slot loading
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
                  key={`${selectedDate}-${slot.startTime}-${index}`} // Ensure unique key
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
        !error && (
          <p className='text-gray-500 text-sm mt-3'>
            No 2-hour slots available for this day. This may be due to existing
            bookings or admin settings.
          </p>
        )}
    </div>
  );
}
