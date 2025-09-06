// src/app/page.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { CheckCircleIcon } from '@/components/icons/CheckCircleIcon';
import { SparkleIcon } from '@/components/icons/SparkleIcon';
import { CarWashIcon } from '@/components/icons/CarWashIcon';
import FindUsSection from '@/components/home/FindUsSection';
import { BikeIcon } from '@/components/icons/BikeIcon';
import NavigationBar, { NavLinkItem } from '@/components/shared/NavigationBar'; // Import new Nav
import Footer from '@/components/shared/Footer'; // Import Footer

export default function HomePage() {
  const homePageNavLinks: NavLinkItem[] = [
    { href: '/admin', label: 'Admin' },
    { href: '#about', label: 'About' },
    { href: '#location', label: 'Find Us' },
    { href: '/booking', label: 'Book Now', isButton: true },
  ];

  return (
    <div className='min-h-screen bg-gray-100 text-gray-800 flex flex-col font-sans'>
      <NavigationBar
        brandName="Jessiah's Auto Care"
        navLinks={homePageNavLinks}
      />

      {/* Main Content */}
      <main className='flex-grow'>
        {/* Hero Section */}
        <section className='relative py-24 md:py-36 text-center overflow-hidden bg-gray-50'>
          <div className='container mx-auto px-4 sm:px-6 relative z-10'>
            <CarWashIcon className='w-16 h-16 text-purple-500 mx-auto mb-6' />
            <h1 className='text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 tracking-tight text-gray-900'>
              <span className='block'>Jessiah&apos;s</span>
              <span className=' text-purple-600'>Auto Care</span>
            </h1>
            <p className='text-lg sm:text-xl md:text-2xl text-gray-700 mb-10 max-w-2xl mx-auto'>
              Experience the ultimate clean. I meticulously restore your
              car&apos;s inside shine!
            </p>
            <Link
              href='/booking'
              className='bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 sm:py-4 sm:px-10 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-600/50'
            >
              Schedule Your Clean
            </Link>
          </div>
        </section>

        {/* About Jessiah Section */}
        <section id='about' className='py-16 md:py-24 bg-gray-100'>
          <div className='container mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center gap-8 md:gap-12'>
            <div className='md:w-1/2'>
              <Image
                src='/car_cleaning.JPG'
                alt="Jessiah's Car Cleaning and Biking Goal"
                width={600}
                height={400}
                className='rounded-lg shadow-2xl aspect-video object-cover'
              />
            </div>
            <div className='md:w-1/2'>
              <h2 className='text-3xl sm:text-4xl font-bold mb-3 text-purple-600'>
                About The Business
              </h2>
              <p className='text-gray-700 text-lg mb-6 leading-relaxed'>
                Hi, I&apos;m Jessiah, a dedicated 13-year-old entrepreneur
                providing quality interior car cleaning services. I started this
                business with a clear goal in mind – saving for a new downhill
                mountain bike to compete in the upcoming NZ Nationals. Every job
                I complete brings me closer to achieving this dream while
                providing excellent service to my community.
              </p>

              <h3 className='text-2xl font-semibold mb-4 text-purple-500'>
                Why Choose Jessiah&apos;s Service?
              </h3>
              <ul className='space-y-4 text-gray-700 text-lg'>
                <li className='flex items-start'>
                  <BikeIcon className='w-7 h-7 text-green-500 mr-3 mt-1 flex-shrink-0' />
                  <div>
                    <span className='font-semibold'>
                      Motivated and reliable
                    </span>{' '}
                    – My goal to compete at NZ Nationals means I approach every
                    job with focus and determination. Your satisfaction directly
                    supports my athletic ambitions, ensuring I deliver quality
                    results every time.
                  </div>
                </li>
                <li className='flex items-start'>
                  <CheckCircleIcon className='w-7 h-7 text-green-500 mr-3 mt-1 flex-shrink-0' />
                  <div>
                    <span className='font-semibold'>Attention to detail</span> –
                    As a young athlete, I understand the importance of
                    preparation and precision. I bring this same mindset to
                    cleaning your vehicle&apos;s interior.
                  </div>
                </li>
                <li className='flex items-start'>
                  <SparkleIcon className='w-7 h-7 text-green-500 mr-3 mt-1 flex-shrink-0' />
                  <div>
                    <span className='font-semibold'>Community support</span> –
                    When you hire me, you&apos;re supporting a local young
                    person working toward their goals while receiving
                    professional service.
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <FindUsSection />

        <section
          id='contact'
          className='py-16 md:py-24 bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 text-white'
        >
          <div className='container mx-auto px-4 sm:px-6 text-center'>
            <h2 className='text-3xl sm:text-4xl font-bold mb-6'>
              Ready for a Spotless Car?
            </h2>
            <p className='text-xl mb-10 max-w-xl mx-auto leading-relaxed'>
              Let Jessiah take care of your car. Book an appointment today and
              experience the difference!
            </p>
            <Link
              href='/booking'
              className='bg-gray-100 hover:bg-gray-200 text-purple-700 font-bold py-3 px-8 sm:py-4 sm:px-10 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg'
            >
              Book Your Appointment
            </Link>
          </div>
        </section>
      </main>
      <Footer secondaryText='Proudly serving the Hawea community.' />
    </div>
  );
}
