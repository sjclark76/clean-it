// src/components/shared/NavigationBar.tsx
'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { useSession, signOut } from 'next-auth/react'; // For conditional logout
import { SparkleIcon } from '@/components/icons/SparkleIcon'; // Default brand icon
import { MenuIcon } from '@/components/icons/MenuIcon';
import { XIcon } from '@/components/icons/XIcon';

export interface NavLinkItem {
  href: string;
  label: string;
  isButton?: boolean; // For "Book Now" or "Logout" style
  requiresAuth?: boolean; // To show only if authenticated (e.g., Admin, Logout)
  requiresNoAuth?: boolean; // To show only if not authenticated
  isSpecialAction?: boolean; // e.g. Logout button
  onClick?: () => void; // For custom actions like closing the mobile menu
}

interface NavigationBarProps {
  brandName: string;
  brandIcon?: React.ReactNode;
  brandHref?: string;
  navLinks: NavLinkItem[];
}

export default function NavigationBar({
  brandName,
  brandIcon,
  brandHref = '/',
  navLinks,
}: NavigationBarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { status } = useSession();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLinkClick = (linkOnClick?: () => void) => {
    if (linkOnClick) {
      linkOnClick();
    }
    setIsMobileMenuOpen(false); // Always close the mobile menu on link click
  };

  const renderLink = (link: NavLinkItem, isMobile: boolean) => {
    if (link.requiresAuth && status !== 'authenticated') return null;
    if (link.requiresNoAuth && status === 'authenticated') return null;

    const commonClasses = isMobile
      ? `block px-3 py-2 rounded-md transition-colors duration-300 ${
          link.isButton
            ? 'bg-purple-600 hover:bg-purple-700 text-white font-semibold text-center'
            : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50'
        }`
      : `px-3 py-2 transition-colors duration-300 ${
          link.isButton
            ? 'bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transform hover:scale-105'
            : 'text-gray-700 hover:text-purple-600'
        }`;

    if (link.isSpecialAction && link.label.toLowerCase() === 'logout') {
      return (
        <button
          key={link.href} // Use href as a key for consistency, though it's a button
          onClick={() => {
            signOut({ callbackUrl: '/' }).then(() => {
              handleLinkClick(link.onClick);
            });
          }}
          className={commonClasses}
        >
          {link.label}
        </button>
      );
    }

    return (
      <Link
        key={link.href}
        href={link.href}
        className={commonClasses}
        onClick={() => handleLinkClick(link.onClick)}
      >
        {link.label}
      </Link>
    );
  };

  return (
    <header className='bg-white/80 backdrop-blur-md shadow-md sticky top-0 z-50'>
      <nav className='container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center'>
        <Link
          href={brandHref}
          className='text-xl sm:text-2xl font-bold text-purple-600 hover:text-purple-500 transition-colors duration-300 flex items-center'
        >
          {brandIcon || <SparkleIcon className='w-6 h-6 sm:w-7 sm:h-7 mr-2' />}
          {brandName}
        </Link>

        {/* Desktop Menu */}
        <div className='hidden md:flex items-center space-x-2 lg:space-x-4'>
          {navLinks.map((link) => renderLink(link, false))}
        </div>

        {/* Mobile Menu Button */}
        <div className='md:hidden'>
          <button
            onClick={toggleMobileMenu}
            aria-label='Toggle menu'
            className='text-gray-700 hover:text-purple-600 focus:outline-none'
          >
            {isMobileMenuOpen ? (
              <XIcon className='w-7 h-7' />
            ) : (
              <MenuIcon className='w-7 h-7' />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu - Dropdown */}
      {isMobileMenuOpen && (
        <div className='md:hidden bg-white shadow-lg absolute top-full left-0 right-0 z-40'>
          <div className='container mx-auto px-4 py-4 flex flex-col space-y-3'>
            {navLinks.map((link) => renderLink(link, true))}
          </div>
        </div>
      )}
    </header>
  );
}
