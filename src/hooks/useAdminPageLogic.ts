// src/hooks/useAdminPageLogic.ts
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

export function useAdminPageLogic() {
  const initialDate = new Date().toISOString().split('T')[0];
  const [selectedDateForEditing, setSelectedDateForEditing] =
    useState<string>(initialDate);

  const getDefaultSlotsForEditing = useCallback((): TimeSlot[] => {
    return PREDEFINED_TIMES.map((time, index) => ({
      id: `slot-${index}-${Date.now()}`, // Ensure unique IDs
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

  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState<boolean>(true);
  const [bookingsError, setBookingsError] = useState<string | null>(null);
  const [isUpdatingBooking, setIsUpdatingBooking] = useState<string | null>(
    null
  );

  const fetchUpcomingAvailability = useCallback(async () => {
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
  }, []);

  const fetchUpcomingBookings = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    const existingDayData = upcomingAvailability.find(
      (day) => day.date === selectedDateForEditing
    );
    if (existingDayData) {
      const editorSlots = PREDEFINED_TIMES.map((time, index) => {
        const existingSlot = existingDayData.slots.find((s) => s.time === time);
        return {
          id: `edit-slot-${index}-${selectedDateForEditing}-${Math.random()}`, // Ensure unique ID
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
    const date = new Date(dateString + 'T00:00:00'); // Ensure correct parsing for local timezone
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
        id, // Send the ID back
      })),
    };

    try {
      const response = await fetch('/api/admin/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (response.ok) {
        setEditMessage(result.message || 'Availability saved successfully!');
        setEditMessageType('success');
        fetchUpcomingAvailability();
      } else {
        setEditMessage(result.message || 'Failed to save availability.');
        setEditMessageType('error');
      }
    } catch (err) {
      setEditMessage(
        (err instanceof Error ? err.message : 'An unexpected error occurred') +
          '. Please try again.'
      );
      setEditMessageType('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateBookingStatus = async (
    bookingId: string | undefined,
    action: 'confirm' | 'cancel'
  ) => {
    if (!bookingId) return;

    setIsUpdatingBooking(bookingId);
    setEditMessage(null);
    setEditMessageType(null);

    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const result = await response.json();

      if (response.ok) {
        if (action === 'cancel') {
          setUpcomingBookings((prevBookings) =>
            prevBookings.filter((b) => b._id?.toString() !== bookingId)
          );
          setEditMessage(result.message || 'Booking cancelled successfully.');
          setEditMessageType('success');
        } else if (action === 'confirm' && result.booking) {
          const updatedBookingFromServer = result.booking as Booking;
          setUpcomingBookings((prevBookings) =>
            prevBookings.map((b) =>
              b._id?.toString() === bookingId ? updatedBookingFromServer : b
            )
          );
          setEditMessage(result.message || 'Booking confirmed successfully.');
          setEditMessageType('success');
        } else if (action === 'confirm' && !result.booking) {
          setEditMessage(
            result.message ||
              'Confirmation processed, but booking data was not returned.'
          );
          setEditMessageType('error');
        }
      } else {
        setEditMessage(result.message || `Failed to ${action} booking.`);
        setEditMessageType('error');
      }
    } catch {
      setEditMessage(
        `An unexpected error occurred while ${action}ing the booking.`
      );
      setEditMessageType('error');
    } finally {
      setIsUpdatingBooking(null);
    }
  };

  const handleConfirmBooking = (bookingId: string | undefined) =>
    handleUpdateBookingStatus(bookingId, 'confirm');
  const handleCancelBooking = (bookingId: string | undefined) =>
    handleUpdateBookingStatus(bookingId, 'cancel');

  // Formatting functions (can be part of the hook or separate utils)
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
    currentBookings: Booking[] // Pass current bookings to ensure fresh data
  ): Booking['status'] | null => {
    const slotTimeInMinutes = timeToMinutes(slotTime);
    const activeBookingsForDay = currentBookings.filter(
      (b) => b.date === dayDate && b.status !== 'cancelled'
    );

    for (const booking of activeBookingsForDay) {
      const bookingStartMinutes = timeToMinutes(booking.startTime);
      const bookingCoversUntilMinutes = bookingStartMinutes + 150;

      if (
        slotTimeInMinutes >= bookingStartMinutes &&
        slotTimeInMinutes < bookingCoversUntilMinutes
      ) {
        return booking.status;
      }
    }
    return null;
  };

  return {
    selectedDateForEditing,
    timeSlotsForEditing,
    isSaving,
    editMessage,
    editMessageType,
    upcomingAvailability,
    isLoadingAvailability,
    availabilityError,
    upcomingBookings,
    isLoadingBookings,
    bookingsError,
    isUpdatingBooking,
    fetchUpcomingAvailability,
    fetchUpcomingBookings,
    handleDateChangeForEditing,
    handleSlotToggleForEditing,
    handleSubmitAvailability,
    handleConfirmBooking,
    handleCancelBooking,
    formatDateDisplay,
    formatBookingStatus,
    isGeneralSlotBooked,
  };
}
