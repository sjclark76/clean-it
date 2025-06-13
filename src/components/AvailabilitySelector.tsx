// src/components/AvailabilitySelector.tsx
'use client';

import React, { useState, useEffect, useCallback, Fragment } from 'react'; // Added Fragment
import { Listbox, Transition } from '@headlessui/react'; // Import Listbox and Transition
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'; // Icons for Listbox
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
  const [adminDates, setAdminDates] = useState<DayAvailability[]>([]);
  const [bookableSlotsForSelectedDate, setBookableSlotsForSelectedDate] =
    useState<BookableSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<DayAvailability | null>(
    null
  ); // Changed to store the whole DayAvailability object
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
        const response = await fetch('/api/bookable-dates-list');
        if (!response.ok)
          throw new Error('Failed to fetch bookable admin dates');
        const data: DayAvailability[] = await response.json();
        setAdminDates(data);
        // Optionally, pre-select the first available date
        // if (data.length > 0) {
        //   setSelectedDate(data[0]);
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
      fetchBookableSlotsForDate(selectedDate.date); // Use selectedDate.date
    } else {
      setBookableSlotsForSelectedDate([]);
    }
  }, [selectedDate, fetchBookableSlotsForDate]);

  // handleDateChange is now handled by Listbox's onChange
  // const handleDateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
  //   setSelectedDate(event.target.value);
  // };

  const handleTimeSlotClick = (slot: BookableSlot) => {
    if (selectedDate) {
      setSelectedBookableSlotTime(slot.startTime);
      onSlotSelect(selectedDate.date, slot.startTime); // Use selectedDate.date
    } else {
      console.error('Date not selected, cannot select time slot.');
    }
  };

  const formatDateDisplay = (dateString: string) => {
    const dateObj = new Date(dateString + 'T00:00:00'); // Ensure correct date parsing
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
        <Listbox value={selectedDate} onChange={setSelectedDate}>
          {({ open }) => (
            <>
              <Listbox.Label className='block text-sm font-medium text-gray-700 mb-1'>
                Choose a Date:
              </Listbox.Label>
              <div className='relative mt-1'>
                <Listbox.Button className='relative w-full cursor-default rounded-md bg-white py-3 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 sm:text-sm sm:leading-6'>
                  <span className='block truncate'>
                    {selectedDate
                      ? formatDateDisplay(selectedDate.date)
                      : adminDates.length === 0
                        ? 'No dates available'
                        : 'Select a date'}
                  </span>
                  <span className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2'>
                    <ChevronUpDownIcon
                      className='h-5 w-5 text-gray-400'
                      aria-hidden='true'
                    />
                  </span>
                </Listbox.Button>

                <Transition
                  show={open && adminDates.length > 0}
                  as={Fragment}
                  leave='transition ease-in duration-100'
                  leaveFrom='opacity-100'
                  leaveTo='opacity-0'
                >
                  <Listbox.Options className='absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm'>
                    {adminDates.map((day) => (
                      <Listbox.Option
                        key={day.date}
                        className={({ active }) =>
                          `relative cursor-default select-none py-2 pl-3 pr-9 ${
                            active
                              ? 'bg-purple-100 text-purple-700'
                              : 'text-gray-900'
                          }`
                        }
                        value={day}
                      >
                        {({ selected, active }) => (
                          <>
                            <span
                              className={`block truncate ${
                                selected ? 'font-semibold' : 'font-normal'
                              }`}
                            >
                              {formatDateDisplay(day.date)}
                            </span>
                            {selected ? (
                              <span
                                className={`absolute inset-y-0 right-0 flex items-center pr-4 ${
                                  active ? 'text-purple-700' : 'text-purple-600'
                                }`}
                              >
                                <CheckIcon
                                  className='h-5 w-5'
                                  aria-hidden='true'
                                />
                              </span>
                            ) : null}
                          </>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Transition>
              </div>
            </>
          )}
        </Listbox>
      </div>

      {isLoadingSlots &&
        selectedDate && ( // Show loading only if a date is selected
          <div className='p-4 text-center text-gray-600'>
            Loading available slots for {formatDateDisplay(selectedDate.date)}
            ...
          </div>
        )}

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
              Available 2-hour slots for {formatDateDisplay(selectedDate.date)}:
            </h4>
            <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
              {bookableSlotsForSelectedDate.map((slot, index) => (
                <button
                  key={`${selectedDate.date}-${slot.startTime}-${index}`}
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
