// src/components/booking/BookingForm.tsx
'use client';

import { useState } from 'react';
import AvailabilitySelector from '@/components/AvailabilitySelector';

interface BookingFormProps {
  services: string[];
}

export default function BookingForm({ services }: BookingFormProps) {
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
    const form = event.currentTarget;
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

    const formData = new FormData(form);
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
        form.reset();
        setSelectedBookingSlot(null);
        // Consider how AvailabilitySelector might be refreshed if needed
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

  const handleSlotSelected = (date: string, time: string) => {
    setSelectedBookingSlot({ date, time });
    setFormMessage(null);
    console.log('Slot selected in BookingForm:', date, time);
  };

  return (
    <>
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
            rows={3}
            className='w-full bg-gray-50 border-gray-300 text-gray-900 rounded-md p-3 focus:ring-purple-500 focus:border-purple-500'
            placeholder='e.g., specific areas of concern, car model, etc.'
          ></textarea>
        </div>
        <div>
          <button
            type='submit'
            disabled={isLoading || !selectedBookingSlot}
            className='w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed'
          >
            {isLoading ? 'Submitting Request...' : 'Request Appointment'}
          </button>
        </div>
      </form>
    </>
  );
}
