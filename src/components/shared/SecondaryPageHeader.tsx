// src/components/shared/SecondaryPageHeader.tsx
'use client';

import NavigationBar, { NavLinkItem } from './NavigationBar';
import { CalendarIcon } from '@/components/icons/CalendarIcon';

export default function SecondaryPageHeader() {
  const secondaryPageNavLinks: NavLinkItem[] = [
    { href: '/', label: '← Back to Home' },
    {
      href: '#',
      label: 'Logout',
      isButton: true,
      requiresAuth: true,
      isSpecialAction: true,
    },
    // Add other links specific to secondary pages if needed
  ];

  return (
    <NavigationBar
      brandName="Jessiah's Car Spa"
      brandIcon={<CalendarIcon className='w-6 h-6 sm:w-7 sm:h-7 mr-2' />}
      navLinks={secondaryPageNavLinks}
    />
  );
}
