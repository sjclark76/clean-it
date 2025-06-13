// src/app/booking/page.tsx
'use client';

import { useState } from 'react';
import AvailabilitySelector from '@/components/AvailabilitySelector';
import { CalendarIcon } from '@/components/icons/CalendarIcon'; // Adjust path if needed

export default function BookingPage() {
  const [selectedBookingSlot, setSelectedBookingSlot] = useState<{
    date: string;
    time: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formMessage, setFormMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget; // Store the form reference here
    setIsLoading(true);
    setFormMessage(null);

    if (!selectedBookingSlot) {
      setFormMessage({
        type: 'error',
        text: 'Please select an available date and time slot.',
      });
      setIsLoading(false);
      return;
    }

    const formData = new FormData(form); // Use the stored reference
    const bookingPayload = {
      date: selectedBookingSlot.date,
      startTime: selectedBookingSlot.time,
      clientName: formData.get('name') as string,
      clientEmail: formData.get('email') as string,
      clientPhone: formData.get('phone') as string,
      serviceType: formData.get('service') as string,
      notes: formData.get('notes') as string | undefined,
    };

    try {
      // In a previous response, this was corrected to '/api/bookings'.
      // Ensure it matches your actual API endpoint.
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingPayload),
      });

      const result = await response.json();

      if (response.ok) {
        setFormMessage({
          type: 'success',
          text:
            result.message ||
            'Booking request successful! Jessiah will contact you to confirm.',
        });
        form.reset(); // Use the stored form reference to reset
        setSelectedBookingSlot(null);
        // Optionally, you might want to trigger a refresh of the AvailabilitySelector
        // if it needs to update its slots immediately after a booking.
      } else {
        setFormMessage({
          type: 'error',
          text: result.message || 'Booking failed. Please try again.',
        });
      }
    } catch (error) {
      console.error('Booking submission error:', error);
      setFormMessage({
        type: 'error',
        text: 'An unexpected error occurred during booking.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const services = [
    'Exterior Wash & Wax',
    'Interior Deep Clean',
    'Full Detail Package',
    'Other (Please specify in notes)',
  ];

  const handleSlotSelected = (date: string, time: string) => {
    setSelectedBookingSlot({ date, time });
    setFormMessage(null); // Clear any previous messages when a new slot is selected
    console.log('Slot selected in parent:', date, time);
  };

  return (
    <div className='min-h-screen bg-gray-100 text-gray-800 flex flex-col font-sans'>
      <header className='bg-white/80 backdrop-blur-md shadow-md sticky top-0 z-50'>
        <nav className='container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center'>
          <a
            href='/'
            className='text-2xl font-bold text-purple-600 hover:text-purple-500 transition-colors duration-300 flex items-center'
          >
            <CalendarIcon className='w-7 h-7 mr-2' />
            Jessiah's Car Cleaning
          </a>
          <a
            href='/'
            className='px-3 py-2 text-gray-700 hover:text-purple-600 transition-colors duration-300'
          >
            &larr; Back to Home
          </a>
        </nav>
      </header>

      <main className='flex-grow py-12 md:py-20'>
        <div className='container mx-auto px-4 sm:px-6'>
          <div className='max-w-2xl mx-auto bg-white p-8 md:p-10 rounded-xl shadow-xl'>
            <div className='text-center mb-8'>
              <CalendarIcon className='w-12 h-12 text-purple-500 mx-auto mb-4' />
              <h1 className='text-3xl sm:text-4xl font-bold text-purple-600 mb-2'>
                Book Your Service
              </h1>
              <p className='text-gray-600 text-lg'>
                Fill out the form below and select an available 2-hour slot to
                request an appointment.
              </p>
            </div>

            {formMessage && (
              <div
                className={`p-3 mb-4 rounded-md text-sm ${
                  formMessage.type === 'success'
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : 'bg-red-100 text-red-700 border border-red-300'
                }`}
              >
                {formMessage.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className='space-y-6'>
              <div>
                <label
                  htmlFor='name'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Full Name
                </label>
                <input
                  type='text'
                  name='name'
                  id='name'
                  required
                  className='w-full bg-gray-50 border-gray-300 text-gray-900 rounded-md p-3 focus:ring-purple-500 focus:border-purple-500'
                  placeholder='e.g., John Doe'
                />
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <label
                    htmlFor='phone'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Phone Number
                  </label>
                  <input
                    type='tel'
                    name='phone'
                    id='phone'
                    required
                    className='w-full bg-gray-50 border-gray-300 text-gray-900 rounded-md p-3 focus:ring-purple-500 focus:border-purple-500'
                    placeholder='(555) 123-4567'
                  />
                </div>
                <div>
                  <label
                    htmlFor='email'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Email Address
                  </label>
                  <input
                    type='email'
                    name='email'
                    id='email'
                    required
                    className='w-full bg-gray-50 border-gray-300 text-gray-900 rounded-md p-3 focus:ring-purple-500 focus:border-purple-500'
                    placeholder='you@example.com'
                  />
                </div>
              </div>

              <AvailabilitySelector onSlotSelect={handleSlotSelected} />

              {/* Hidden inputs are no longer strictly necessary as data is sent via JS payload */}
              {/* {selectedBookingSlot && (
                                <>
                                    <input type="hidden" name="selected_date" value={selectedBookingSlot.date} />
                                    <input type="hidden" name="selected_time" value={selectedBookingSlot.time} />
                                </>
                            )} */}

              <div>
                <label
                  htmlFor='service'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Service Type
                </label>
                <select
                  id='service'
                  name='service'
                  required
                  className='w-full bg-gray-50 border-gray-300 text-gray-900 rounded-md p-3 focus:ring-purple-500 focus:border-purple-500'
                >
                  <option value='' disabled>
                    Select a service
                  </option>
                  {services.map((service) => (
                    <option key={service} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor='notes'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Additional Notes (Optional)
                </label>
                <textarea
                  id='notes'
                  name='notes'
                  rows={3} // Reduced rows for a more compact form
                  className='w-full bg-gray-50 border-gray-300 text-gray-900 rounded-md p-3 focus:ring-purple-500 focus:border-purple-500'
                  placeholder='e.g., specific areas of concern, car model, etc.'
                ></textarea>
              </div>
              <div>
                <button
                  type='submit'
                  disabled={isLoading || !selectedBookingSlot} // Disable button if loading or no slot selected
                  className='w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed'
                >
                  {isLoading ? 'Submitting Request...' : 'Request Appointment'}
                </button>
              </div>
            </form>
            <p className='text-center text-gray-600 mt-8 text-sm'>
              Please note: This is a request. Your appointment is confirmed once
              Jessiah contacts you.
            </p>
          </div>
        </div>
      </main>
      <footer className='bg-gray-200 text-center py-10'>
        <div className='container mx-auto px-4 sm:px-6'>
          <p className='text-gray-600'>
            &copy; {new Date().getFullYear()} Jessiah's Car Cleaning.
          </p>
        </div>
      </footer>
    </div>
  );
}
