// src/app/admin/page.tsx
'use client';

import {
  useState,
  FormEvent,
  ChangeEvent,
  useCallback,
  useEffect,
} from 'react';
import { Booking, DayAvailability, TimeSlot } from '@/types';
import { timeToMinutes } from '@/shared/timeFunctions';

// Import the new components
import AvailabilityEditor from '@/components/admin/AvailabilityEditor';
import UpcomingBookingsList from '@/components/admin/UpcomingBookingsList';
import GeneralAvailabilityList from '@/components/admin/GeneralAvailabilityList';

const PREDEFINED_TIMES = [
  '08:00 AM',
  '08:30 AM',
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '12:00 PM',
  '12:30 PM',
  '01:00 PM',
  '01:30 PM',
  '02:00 PM',
  '02:30 PM',
  '03:00 PM',
  '03:30 PM',
  '04:00 PM',
  '04:30 PM',
  '05:00 PM',
];

export default function AdminAvailabilityPage() {
  const initialDate = new Date().toISOString().split('T')[0];
  const [selectedDateForEditing, setSelectedDateForEditing] =
    useState<string>(initialDate);

  const getDefaultSlotsForEditing = useCallback((): TimeSlot[] => {
    return PREDEFINED_TIMES.map((time, index) => ({
      id: `slot-${index}-${Date.now()}`,
      time,
      available: false,
    }));
  }, []);

  const [timeSlotsForEditing, setTimeSlotsForEditing] = useState<TimeSlot[]>(
    getDefaultSlotsForEditing
  );

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [editMessage, setEditMessage] = useState<string | null>(null);
  const [editMessageType, setEditMessageType] = useState<
    'success' | 'error' | null
  >(null);

  const [upcomingAvailability, setUpcomingAvailability] = useState<
    DayAvailability[]
  >([]);
  const [isLoadingAvailability, setIsLoadingAvailability] =
    useState<boolean>(true);
  const [availabilityError, setAvailabilityError] = useState<string | null>(
    null
  );
  const [isUpdatingBooking, setIsUpdatingBooking] = useState<string | null>(
    null
  ); // Tracks which booking ID is being updated
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState<boolean>(true);
  const [bookingsError, setBookingsError] = useState<string | null>(null);

  const fetchUpcomingAvailability = useCallback(async () => {
    setIsLoadingAvailability(true);
    setAvailabilityError(null);
    try {
      const response = await fetch('/api/availability');
      if (!response.ok) {
        throw new Error('Failed to fetch upcoming availability');
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
  }, []);

  const fetchUpcomingBookings = useCallback(async () => {
    setIsLoadingBookings(true);
    setBookingsError(null);
    try {
      const response = await fetch('/api/bookings'); // Ensure this is your admin bookings endpoint
      if (!response.ok) {
        throw new Error('Failed to fetch upcoming bookings');
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
  }, []);

  useEffect(() => {
    fetchUpcomingAvailability();
    fetchUpcomingBookings();
  }, [fetchUpcomingAvailability, fetchUpcomingBookings]);

  useEffect(() => {
    const existingDayData = upcomingAvailability.find(
      (day) => day.date === selectedDateForEditing
    );
    if (existingDayData) {
      const editorSlots = PREDEFINED_TIMES.map((time, index) => {
        const existingSlot = existingDayData.slots.find((s) => s.time === time);
        return {
          id: `edit-slot-${index}-${selectedDateForEditing}`,
          time,
          available: existingSlot ? existingSlot.available : false,
        };
      });
      setTimeSlotsForEditing(editorSlots);
    } else {
      setTimeSlotsForEditing(getDefaultSlotsForEditing());
    }
  }, [selectedDateForEditing, upcomingAvailability, getDefaultSlotsForEditing]);

  const handleDateChangeForEditing = (e: ChangeEvent<HTMLInputElement>) => {
    setSelectedDateForEditing(e.target.value);
    setEditMessage(null);
  };

  const handleSlotToggleForEditing = (toggledSlotId: string) => {
    setTimeSlotsForEditing((prevSlots) =>
      prevSlots.map((s) =>
        s.id === toggledSlotId ? { ...s, available: !s.available } : s
      )
    );
    setEditMessage(null);
  };

  const getDayName = (dateString: string): string => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const handleSubmitAvailability = async (event: FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setEditMessage(null);
    setEditMessageType(null);

    const dayName = getDayName(selectedDateForEditing);
    const payload = {
      date: selectedDateForEditing,
      dayName: dayName,
      slots: timeSlotsForEditing.map(({ time, available, id }) => ({
        time,
        available,
        id,
      })),
    };

    try {
      const response = await fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (response.ok) {
        setEditMessage(result.message || 'Availability saved successfully!');
        setEditMessageType('success');
        fetchUpcomingAvailability(); // Refresh general availability
        // Optionally, refresh bookings if saving availability could affect them
        // fetchUpcomingBookings();
      } else {
        setEditMessage(result.message || 'Failed to save availability.');
        setEditMessageType('error');
      }
    } catch {
      setEditMessage('An unexpected error occurred. Please try again.');
      setEditMessageType('error');
    } finally {
      setIsSaving(false);
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

  const formatBookingStatus = (status: Booking['status']) => {
    switch (status) {
      case 'pending_confirmation':
        return 'Pending';
      case 'confirmed':
        return 'Confirmed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const isGeneralSlotBooked = (
    slotTime: string,
    dayDate: string,
    bookings: Booking[]
  ): Booking['status'] | null => {
    // Changed return type
    const slotTimeInMinutes = timeToMinutes(slotTime);
    // Consider only non-cancelled bookings for overlap checks
    const activeBookingsForDay = bookings.filter(
      (b) => b.date === dayDate && b.status !== 'cancelled'
    );

    for (const booking of activeBookingsForDay) {
      const bookingStartMinutes = timeToMinutes(booking.startTime);
      // The total block for a booking is service (2hr = 120min) + buffer (30min) = 150min
      const bookingCoversUntilMinutes = bookingStartMinutes + 150;

      if (
        slotTimeInMinutes >= bookingStartMinutes &&
        slotTimeInMinutes < bookingCoversUntilMinutes
      ) {
        return booking.status; // Return the status of the booking covering this slot
      }
    }
    return null; // Slot is not covered by any active booking
  };

  const handleUpdateBookingStatus = async (
    bookingId: string | undefined,
    action: 'confirm' | 'cancel'
  ) => {
    setIsUpdatingBooking(bookingId ?? '');
    setEditMessage(null); // Clear general edit messages
    setEditMessageType(null);

    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      const result = await response.json();

      if (response.ok && result.booking) {
        setUpcomingBookings((prevBookings) =>
          prevBookings.map((b) =>
            b._id?.toString() === bookingId ? result.booking : b
          )
        );
        // Set a success message specific to this action if desired, or rely on UI change
        // For example:
        // setEditMessage(`Booking ${bookingId} ${action === 'confirm' ? 'confirmed' : 'cancelled'}.`);
        // setEditMessageType('success');
      } else {
        // Handle specific error from API or a generic one
        setEditMessage(result.message || `Failed to ${action} booking.`);
        setEditMessageType('error');
        console.error(`Failed to ${action} booking:`, result.message);
      }
    } catch (error) {
      console.error(`Error ${action}ing booking:`, error);
      setEditMessage(
        `An unexpected error occurred while ${action}ing the booking.`
      );
      setEditMessageType('error');
    } finally {
      setIsUpdatingBooking(null);
    }
  };
  const handleConfirmBooking = async (bookingId: string | undefined) => {
    await handleUpdateBookingStatus(bookingId, 'confirm');
  };

  const handleCancelBooking = async (bookingId: string | undefined) => {
    await handleUpdateBookingStatus(bookingId, 'cancel');
  };

  return (
    <div className='min-h-screen bg-gray-100 text-gray-800 flex flex-col font-sans'>
      <header className='bg-white shadow-md'>
        <nav className='container mx-auto px-6 py-4'>
          <h1 className='text-2xl font-bold text-purple-600'>
            Admin Dashboard
          </h1>
        </nav>
      </header>

      <main className='flex-grow container mx-auto px-6 py-8 grid lg:grid-cols-3 gap-8'>
        <AvailabilityEditor
          selectedDate={selectedDateForEditing}
          timeSlots={timeSlotsForEditing}
          isSaving={isSaving}
          editMessage={editMessage}
          editMessageType={editMessageType}
          onDateChange={handleDateChangeForEditing}
          onSlotToggle={handleSlotToggleForEditing}
          onSubmit={handleSubmitAvailability}
          formatDateDisplay={formatDateDisplay}
        />

        <UpcomingBookingsList
          bookings={upcomingBookings}
          isLoading={isLoadingBookings}
          error={bookingsError}
          formatDateDisplay={formatDateDisplay}
          formatBookingStatus={formatBookingStatus}
          onConfirmBooking={handleConfirmBooking} // Pass down the handler
          onCancelBooking={handleCancelBooking} // Pass down the handler
          isUpdatingBooking={isUpdatingBooking} // Pass down loading state
        />

        <GeneralAvailabilityList
          availability={upcomingAvailability}
          bookings={upcomingBookings}
          isLoading={isLoadingAvailability}
          error={availabilityError}
          formatDateDisplay={formatDateDisplay}
          isGeneralSlotBooked={isGeneralSlotBooked}
        />
      </main>

      <footer className='bg-gray-200 text-center py-6 mt-auto'>
        <p className='text-gray-600'>
          &copy; {new Date().getFullYear()} Jessiah`&apos;s Car Cleaning - Admin
        </p>
      </footer>
    </div>
  );
}
