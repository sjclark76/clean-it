// src/app/admin/page.tsx
'use client';

import { useEffect } from 'react'; // Only useEffect needed here now
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

// Import the presentational components
import AvailabilityEditor from '@/components/admin/AvailabilityEditor';
import UpcomingBookingsList from '@/components/admin/UpcomingBookingsList';
import GeneralAvailabilityList from '@/components/admin/GeneralAvailabilityList';
import SecondaryPageHeader from '@/components/shared/SecondaryPageHeader';
import Footer from '@/components/shared/Footer';
import { useUpcomingAvailability } from '@/hooks/useUpcomingAvailability';
import { useUpcomingBookings } from '@/hooks/useUpcomingBookings';

export default function AdminAvailabilityPage() {
  const { status } = useSession();

  const fetchUpcomingAvailability = useUpcomingAvailability();
  const fetchUpcomingBookings = useUpcomingBookings();

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

  // If the status is 'authenticated', render the page content
  return (
    <div className='min-h-screen bg-gray-100 text-gray-800 flex flex-col font-sans'>
      <SecondaryPageHeader />

      <main className='flex-grow container mx-auto px-6 py-8 grid lg:grid-cols-3 gap-8'>
        <AvailabilityEditor />
        <UpcomingBookingsList />
        <GeneralAvailabilityList />
      </main>

      <Footer />
    </div>
  );
}
