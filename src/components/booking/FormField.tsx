// src/components/booking/FormField.tsx
'use client';

import React from 'react';
// Import StyledDropdown if you decide to use it directly here,
// otherwise, the parent component will render it.
// For this example, we'll assume the parent handles the StyledDropdown.

interface FormFieldProps {
  id: string;
  name: string;
  label: string;
  type?: 'text' | 'tel' | 'email' | 'textarea'; // Removed 'select'
  required?: boolean;
  placeholder?: string;
  rows?: number;
}

export default function FormField({
  id,
  name,
  label,
  type = 'text',
  required = false,
  placeholder,
  rows,
}: FormFieldProps) {
  const baseInputStyles =
    'w-full bg-gray-50 border-gray-300 text-gray-900 rounded-md focus:ring-purple-500 focus:border-purple-500';

  const floatingLabelEnabledInputClasses = `${baseInputStyles} block px-3 pb-2.5 pt-5 text-sm appearance-none focus:outline-none focus:ring-1 peer`;

  if (type === 'text' || type === 'tel' || type === 'email') {
    return (
      <div className='relative'>
        <input
          type={type}
          name={name}
          id={id}
          required={required}
          className={floatingLabelEnabledInputClasses}
          placeholder=' '
        />
        <label
          htmlFor={id}
          className={`
            absolute text-sm text-gray-500 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0]
            start-3
            peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-gray-400
            peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-purple-600
            pointer-events-none
          `}
        >
          {label}
        </label>
      </div>
    );
  }

  // Handle textarea
  if (type === 'textarea') {
    return (
      <div>
        <label
          htmlFor={id}
          className='block text-sm font-medium text-gray-700 mb-1'
        >
          {label}
        </label>
        <textarea
          id={id}
          name={name}
          rows={rows || 3}
          required={required}
          className={`${baseInputStyles} p-3`}
          placeholder={placeholder}
        />
      </div>
    );
  }

  // Fallback for any other types (or if 'select' was passed by mistake)
  // Or you could throw an error for unsupported types.
  console.warn(`FormField: Unsupported type "${type}" provided for ${name}.`);
  return null;
}
