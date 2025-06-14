// src/app/admin/page.tsx
'use client';

import { useEffect } from 'react'; // Only useEffect needed here now
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

// Import the new hook
import { useAdminPageLogic } from '@/hooks/useAdminPageLogic'; // Adjust path if needed

// Import the presentational components
import AvailabilityEditor from '@/components/admin/AvailabilityEditor';
import UpcomingBookingsList from '@/components/admin/UpcomingBookingsList';
import GeneralAvailabilityList from '@/components/admin/GeneralAvailabilityList';
import SecondaryPageHeader from '@/components/shared/SecondaryPageHeader';

export default function AdminAvailabilityPage() {
  const { status } = useSession();

  // Use the custom hook for all page logic
  const {
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
  } = useAdminPageLogic();

  // Authentication check and initial data fetch
  useEffect(() => {
    if (status === 'authenticated') {
      fetchUpcomingAvailability();
      fetchUpcomingBookings();
    }
  }, [status, fetchUpcomingAvailability, fetchUpcomingBookings]);

  if (status === 'loading') {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        Loading authentication...
      </div>
    );
  }

  if (status === 'unauthenticated') {
    redirect('/admin/login');
    return null;
  }

  // If status is 'authenticated', render the page content
  return (
    <div className='min-h-screen bg-gray-100 text-gray-800 flex flex-col font-sans'>
      <SecondaryPageHeader />

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
          onConfirmBooking={handleConfirmBooking}
          onCancelBooking={handleCancelBooking}
          isUpdatingBooking={isUpdatingBooking}
        />

        <GeneralAvailabilityList
          availability={upcomingAvailability}
          bookings={upcomingBookings} // Pass current bookings to the list
          isLoading={isLoadingAvailability}
          error={availabilityError}
          formatDateDisplay={formatDateDisplay}
          isGeneralSlotBooked={(slotTime, dayDate) =>
            isGeneralSlotBooked(slotTime, dayDate, upcomingBookings)
          } // Ensure it uses the current bookings from state
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
