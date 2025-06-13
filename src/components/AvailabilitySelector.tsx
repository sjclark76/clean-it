// src/components/AvailabilitySelector.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { minutesToTime, timeToMinutes } from '@/shared/timeFunctions';
import { DayAvailability } from '@/types';

interface BookableSlot {
  date: string;
  startTime: string; // e.g., "09:00 AM" - this is what the user picks
  displayTime: string; // e.g., "09:00 AM - 11:00 AM"
}

interface AvailabilitySelectorProps {
  onSlotSelect: (date: string, startTime: string) => void;
}

export default function AvailabilitySelector({
  onSlotSelect,
}: AvailabilitySelectorProps) {
  const [adminAvailability, setAdminAvailability] = useState<DayAvailability[]>(
    []
  );
  const [derivedBookableSlots, setDerivedBookableSlots] = useState<
    BookableSlot[]
  >([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedBookableSlotTime, setSelectedBookableSlotTime] = useState<
    string | null
  >(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdminAvailability = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/availability');
        if (!response.ok) throw new Error('Failed to fetch availability');
        const data: DayAvailability[] = await response.json();
        setAdminAvailability(data);
        if (data.length > 0) {
          // Automatically select the first date that has derived slots
          // Or just the first date if you prefer
          const firstDateWithSlots =
            data.find((day) => deriveSlotsForDay(day).length > 0)?.date ||
            data[0]?.date;
          setSelectedDate(firstDateWithSlots || null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAdminAvailability();
  }, []);

  const deriveSlotsForDay = (dayData: DayAvailability): BookableSlot[] => {
    const bookable: BookableSlot[] = [];
    if (!dayData || !dayData.slots) return bookable;

    const sortedAdminSlots = [...dayData.slots].sort(
      (a, b) => timeToMinutes(a.time) - timeToMinutes(b.time)
    );

    // A 2-hour service needs 4 consecutive half-hour slots.
    // A 30-min buffer needs 1 more half-hour slot.
    // Total 5 consecutive half-hour slots (2.5 hours) from admin's availability.
    const requiredConsecutiveSlots = 5; // 4 for service (2hr) + 1 for buffer (0.5hr)

    for (
      let i = 0;
      i <= sortedAdminSlots.length - requiredConsecutiveSlots;
      i++
    ) {
      let canBook = true;
      for (let j = 0; j < requiredConsecutiveSlots; j++) {
        if (!sortedAdminSlots[i + j] || !sortedAdminSlots[i + j].available) {
          canBook = false;
          break;
        }
      }

      if (canBook) {
        const startTimeStr = sortedAdminSlots[i].time;
        const serviceEndTimeMinutes = timeToMinutes(startTimeStr) + 120; // 2 hours
        const serviceEndTimeStr = minutesToTime(serviceEndTimeMinutes);

        bookable.push({
          date: dayData.date,
          startTime: startTimeStr,
          displayTime: `${startTimeStr} - ${serviceEndTimeStr}`,
        });
      }
    }
    return bookable;
  };

  useEffect(() => {
    if (selectedDate) {
      const dayData = adminAvailability.find((d) => d.date === selectedDate);
      if (dayData) {
        setDerivedBookableSlots(deriveSlotsForDay(dayData));
        setSelectedBookableSlotTime(null); // Reset selected time when date changes
      } else {
        setDerivedBookableSlots([]);
      }
    } else {
      setDerivedBookableSlots([]);
    }
  }, [selectedDate, adminAvailability]);

  const handleDateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDate(event.target.value);
  };

  const handleTimeSlotClick = (slot: BookableSlot) => {
    setSelectedBookableSlotTime(slot.startTime);
    onSlotSelect(slot.date, slot.startTime);
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

  if (isLoading)
    return (
      <div className='p-4 text-center text-gray-600'>
        Loading available slots...
      </div>
    );
  if (error)
    return <div className='p-4 text-center text-red-600'>Error: {error}</div>;
  if (adminAvailability.length === 0)
    return (
      <div className='p-4 text-center text-gray-600'>
        No availability information found.
      </div>
    );

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
        >
          <option value='' disabled>
            Select a date
          </option>
          {adminAvailability.map((day) => (
            <option key={day.date} value={day.date}>
              {formatDateDisplay(day.date)}
            </option>
          ))}
        </select>
      </div>

      {selectedDate && derivedBookableSlots.length > 0 && (
        <div>
          <h4 className='text-md font-medium text-gray-700 mb-3'>
            Available 2-hour slots for {formatDateDisplay(selectedDate)}:
          </h4>
          <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
            {derivedBookableSlots.map((slot) => (
              <button
                key={`${slot.date}-${slot.startTime}`}
                type='button'
                onClick={() => handleTimeSlotClick(slot)}
                className={`
                                    p-3 rounded-md text-sm font-medium border transition-all
                                    ${
                                      selectedBookableSlotTime ===
                                      slot.startTime
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
      {selectedDate && derivedBookableSlots.length === 0 && (
        <p className='text-gray-500 text-sm mt-3'>
          No 2-hour slots available for this day based on current settings.
        </p>
      )}
    </div>
  );
}
