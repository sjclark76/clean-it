// src/components/booking/BookingForm.tsx
'use client';

import { useState } from 'react';
import AvailabilitySelector from '@/components/AvailabilitySelector';
import FormField from '@/components/booking/FormField'; // Standard text/textarea fields
import StyledDropdown from '@/components/shared/StyledDropdown'; // Import your new dropdown

interface BookingFormProps {
  services: string[]; // Keep this as an array of strings
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

  // State for the service type dropdown
  const [selectedService, setSelectedService] = useState<string | null>(null);

  // Transform services strings to StyledDropdownOption[]
  const serviceOptions = services.map((service) => ({
    label: service,
    value: service,
  }));

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
    if (!selectedService) {
      setFormMessage({
        type: 'error',
        text: 'Please select a service type.',
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
      serviceType: selectedService, // Use state variable
      notes: formData.get('notes') as string | undefined,
    };

    // ... (rest of handleSubmit remains the same) ...
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
        form.reset(); // Resets native form fields
        setSelectedBookingSlot(null);
        setSelectedService(null); // Reset service dropdown state
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
    // console.log('Slot selected in BookingForm:', date, time);
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
      {/*
        Note: The onSubmit is on the form, but StyledDropdown is controlled by `selectedService` state.
        The `name` prop on StyledDropdown is less relevant here since we're grabbing the value from state.
      */}
      <form onSubmit={handleSubmit} className='space-y-6'>
        <FormField
          id='name'
          label='Full Name'
          name='name'
          type='text'
          required
        />
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <FormField
            id='phone'
            label='Phone Number'
            name='phone'
            type='tel'
            required
          />
          <FormField
            id='email'
            label='Email Address'
            name='email'
            type='email'
            required
          />
        </div>

        <AvailabilitySelector onSlotSelect={handleSlotSelected} />

        {/* Use StyledDropdown directly */}
        <StyledDropdown
          id='service'
          label='Service Type'
          name='service' // Still good for semantics, though value comes from state
          value={selectedService}
          onChange={setSelectedService}
          options={serviceOptions}
          placeholder='Select a service'
          // required // You'd handle this validation in handleSubmit
        />

        <FormField
          id='notes'
          label='Additional Notes (Optional)'
          name='notes'
          type='textarea'
          rows={3}
        />
        <div>
          <button
            type='submit'
            disabled={isLoading || !selectedBookingSlot || !selectedService}
            className='w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed'
          >
            {isLoading ? 'Submitting Request...' : 'Request Appointment'}
          </button>
        </div>
      </form>
    </>
  );
}
