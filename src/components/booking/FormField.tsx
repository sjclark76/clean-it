// src/components/booking/FormField.tsx
'use client';

import React from 'react';

interface FormFieldProps {
  id: string;
  name: string;
  label: string;
  type?: 'text' | 'tel' | 'email' | 'select' | 'textarea';
  required?: boolean;
  placeholder?: string; // Used for textarea/select, label acts as placeholder for floating inputs
  options?: string[]; // For select type
  rows?: number; // For textarea type
}

export default function FormField({
  id,
  name,
  label,
  type = 'text',
  required = false,
  placeholder,
  options,
  rows,
}: FormFieldProps) {
  const commonInputClasses =
    'w-full bg-gray-50 border-gray-300 text-gray-900 rounded-md p-3 focus:ring-purple-500 focus:border-purple-500';

  // Specific classes for inputs that will have floating labels
  const floatingLabelEnabledInputClasses =
    'block px-3 pb-2.5 pt-5 w-full text-sm text-gray-900 bg-gray-50 rounded-md border border-gray-300 appearance-none focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 peer';

  if (type === 'text' || type === 'tel' || type === 'email') {
    return (
      <div className='relative'>
        <input
          type={type}
          name={name}
          id={id}
          required={required}
          className={floatingLabelEnabledInputClasses}
          // A non-empty placeholder is needed for :placeholder-shown to work correctly.
          // The label itself will act as the visual placeholder.
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

  // Fallback for other input types (select, textarea)
  return (
    <div>
      <label
        htmlFor={id}
        className='block text-sm font-medium text-gray-700 mb-1'
      >
        {label}
      </label>
      {type === 'textarea' ? (
        <textarea
          id={id}
          name={name}
          rows={rows || 3}
          required={required}
          className={commonInputClasses}
          placeholder={placeholder}
        />
      ) : type === 'select' ? (
        <select
          id={id}
          name={name}
          required={required}
          className={commonInputClasses}
          defaultValue=''
        >
          <option value='' disabled>
            {placeholder || `Select ${label.toLowerCase()}`}
          </option>
          {options?.map((optionValue) => (
            <option key={optionValue} value={optionValue}>
              {optionValue}
            </option>
          ))}
        </select>
      ) : (
        // This case would handle any other future input types not explicitly covered.
        <input
          type={type}
          name={name}
          id={id}
          required={required}
          className={commonInputClasses}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}
