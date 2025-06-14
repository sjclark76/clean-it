// src/components/home/FindUsSection.tsx
'use client';

import Link from 'next/link';
import { MapPinIcon } from '@/components/icons/MapPinIcon';

export default function FindUsSection() {
  const address = '180 Capell Avenue, Lake Hawea, New Zealand';
  const encodedAddress = encodeURIComponent(address);
  // Using the direct URL for simplicity, no API key needed for basic embed
  const googleMapsDirectUrl = `https://maps.google.com/maps?q=${encodedAddress}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <section id='location' className='py-16 md:py-24 bg-white'>
      <div className='container mx-auto px-4 sm:px-6'>
        <div className='text-center mb-12'>
          <MapPinIcon className='w-12 h-12 text-purple-500 mx-auto mb-4' />
          <h2 className='text-3xl sm:text-4xl font-bold text-purple-600'>
            How To Find Us
          </h2>
        </div>
        <div className='flex flex-col md:flex-row gap-8 md:gap-12 items-center'>
          <div className='md:w-1/2 text-center md:text-left'>
            <h3 className='text-2xl font-semibold text-gray-800 mb-3'>
              Our Address
            </h3>
            <p className='text-lg text-gray-700 mb-4 leading-relaxed'>
              {address}
            </p>
            <p className='text-gray-600 mb-6'>
              Jessiah operates from his home workshop. Please ensure you have a
              confirmed appointment before visiting.
            </p>
            <Link
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`}
              target='_blank'
              rel='noopener noreferrer'
              className='inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105'
            >
              Get Directions
            </Link>
          </div>
          <div className='md:w-1/2 w-full'>
            <div className='aspect-w-16 aspect-h-9 rounded-lg shadow-xl overflow-hidden'>
              <iframe
                src={googleMapsDirectUrl}
                width='100%'
                height='100%'
                style={{ border: 0 }}
                allowFullScreen={true}
                loading='lazy'
                referrerPolicy='no-referrer-when-downgrade'
                title={`Map of ${address}`}
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
