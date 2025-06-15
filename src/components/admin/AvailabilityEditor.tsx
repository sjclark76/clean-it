// src/components/admin/AvailabilityEditor.tsx
'use client';

import { useAtomValue } from 'jotai';
import { selectedDateForEditingAtom } from '@/components/admin/state';
import { formatDateDisplay } from '@/shared/timeFunctions';
import { useAvailabilityEditorLogic } from '@/components/admin/hooks/useAvailabilityEditorLogic';

export default function AvailabilityEditor() {
  const {
    selectedDateForEditing, // This is the one from the hook, which is tied to the atom
    timeSlotsForEditing,
    isSaving,
    editMessage,
    editMessageType,
    handleDateChange,
    handleSlotToggle,
    handleSubmit,
  } = useAvailabilityEditorLogic();

  // selectedDate is used for the input field's value, which should be the atom's value directly
  const selectedDateInputValue = useAtomValue(selectedDateForEditingAtom);

  return (
    <div className='lg:col-span-1 bg-white p-6 md:p-8 rounded-xl shadow-xl'>
      <h2 className='text-xl md:text-2xl font-semibold mb-2 text-gray-700'>
        Set/Update Working Hours
      </h2>
      <p className='text-sm text-gray-600 mb-6'>
        Select a date and mark all half-hour slots you are available to work.
      </p>

      {editMessage && (
        <div
          className={`p-3 mb-4 rounded-md text-sm ${
            editMessageType === 'success'
              ? 'bg-green-100 text-green-700 border border-green-300'
              : editMessageType === 'error'
                ? 'bg-red-100 text-red-700 border border-red-300'
                : ''
          }`}
        >
          {editMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className='space-y-6'>
        <div>
          <label
            htmlFor='date-edit'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Select Date to Edit:
          </label>
          <input
            type='date'
            id='date-edit'
            value={selectedDateInputValue} // Use the direct atom value for the input
            onChange={handleDateChange} // This will update the atom via the hook
            required
            className='w-full bg-gray-50 border-gray-300 text-gray-900 rounded-md p-3 focus:ring-purple-500 focus:border-purple-500'
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div>
          <h3 className='text-md font-medium text-gray-700 mb-2'>
            Mark Available Half-Hour Slots for{' '}
            {formatDateDisplay(selectedDateForEditing)}:
          </h3>
          <div className='grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-80 overflow-y-auto p-2 border rounded-md bg-gray-50'>
            {timeSlotsForEditing.map((slot) => (
              <label
                key={slot.id}
                className={`flex items-center space-x-2 p-2.5 rounded-md border cursor-pointer transition-colors
                  ${
                    slot.available
                      ? 'bg-purple-100 border-purple-400 ring-1 ring-purple-300'
                      : 'bg-white hover:bg-gray-100 border-gray-300'
                  }`}
              >
                <input
                  type='checkbox'
                  checked={slot.available}
                  onChange={() => handleSlotToggle(slot.id)}
                  className='form-checkbox h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500 focus:ring-offset-1'
                />
                <span
                  className={`text-xs sm:text-sm ${
                    slot.available
                      ? 'font-semibold text-purple-700'
                      : 'text-gray-600'
                  }`}
                >
                  {slot.time}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <button
            type='submit'
            disabled={isSaving}
            className='w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed'
          >
            {isSaving ? 'Saving...' : 'Save Working Hours'}
          </button>
        </div>
      </form>
    </div>
  );
}
