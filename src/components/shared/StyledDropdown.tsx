// src/components/shared/StyledDropdown.tsx
'use client';

import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';

interface StyledDropdownOption {
  value: string;
  label: string;
}

interface StyledDropdownProps {
  label?: string; // Optional label above the dropdown
  value: string | null | undefined;
  onChange: (value: string) => void;
  options: StyledDropdownOption[];
  placeholder?: string;
  id?: string; // For associating with a label
  name?: string; // For form submission if needed, though Listbox is controlled
  required?: boolean; // For form validation, though Listbox doesn't enforce natively
}

export default function StyledDropdown({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  id,
  name,
}: StyledDropdownProps) {
  const selectedOption = options.find((option) => option.value === value);

  return (
    // The main div for the whole component including the external label if any
    <div>
      {/* This is an external label for the entire dropdown unit, if provided.
          It's separate from Headless UI's Listbox.Label for internal accessibility.
          If you intend the label prop to be the Listbox.Label, it needs to be inside <Listbox>.
          Let's assume the 'label' prop is meant to be the visual label for the field.
      */}
      {label && (
        <label
          htmlFor={id} // Standard HTML label association
          className='block text-sm font-medium text-gray-700 mb-1'
        >
          {label}
        </label>
      )}
      <Listbox value={value || ''} onChange={onChange} name={name}>
        {/* If you want a Headless UI specific label, it would go here:
            {label && <Listbox.Label className="sr-only">{label}</Listbox.Label>}
            But for a visible label, the one above is more conventional.
            The error implies you might have had <Listbox.Label> outside <Listbox>
        */}
        <div className='relative mt-1'>
          {' '}
          {/* Adjusted margin-top if external label exists */}
          <Listbox.Button
            id={id} // ID for the button, can be targeted by the external label
            className='relative w-full cursor-default rounded-md bg-white py-3 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 sm:text-sm sm:leading-6'
          >
            <span className='block truncate'>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <span className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2'>
              <ChevronUpDownIcon
                className='h-5 w-5 text-gray-400'
                aria-hidden='true'
              />
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave='transition ease-in duration-100'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <Listbox.Options className='absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm'>
              {options.map((option) => (
                <Listbox.Option
                  key={option.value}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-3 pr-9 ${
                      active ? 'bg-purple-100 text-purple-700' : 'text-gray-900'
                    }`
                  }
                  value={option.value}
                >
                  {({ selected, active }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? 'font-semibold' : 'font-normal'
                        }`}
                      >
                        {option.label}
                      </span>
                      {selected ? (
                        <span
                          className={`absolute inset-y-0 right-0 flex items-center pr-4 ${
                            active ? 'text-purple-700' : 'text-purple-600'
                          }`}
                        >
                          <CheckIcon className='h-5 w-5' aria-hidden='true' />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
}
