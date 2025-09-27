'use client';

import Link from 'next/link';
import { useState } from 'react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-black bg-opacity-50 backdrop-blur-md fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-white grid grid-cols-2" >
              VitalConnect <span className='hidden lg:block'>(aushadhi-OCR)</span>
            </Link>
          </div>
          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link href="/" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-md font-medium">
                Home
              </Link>
              <Link href="/medinfo" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-md font-medium">
                Info
              </Link>
              <Link href="/medstores" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-md font-medium">
                Medstores Nearby
              </Link>
              <Link href="/prescription" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-md font-medium">
                Prescription Reader
              </Link>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="flex items-center space-x-2">
                 <Link href="/tandc" className="text-gray-300 hover:text-white px-4 py-2 rounded-md text-md font-medium">
                    Terms
                </Link>
                <Link href="/availability" className="bg-white text-black px-4 py-2 rounded-md text-md font-medium hover:bg-gray-200">
                    Check Availability
                </Link>
            </div>
          </div>
          {/* Mobile Menu Button */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              type="button"
              className="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {/* Icon for menu: switches between hamburger and close icon */}
              {isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Menu, show/hide based on menu state */}
      {isMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
              Home
            </Link>
            <Link href="/medinfo" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
              Info
            </Link>
            <Link href="/medstores" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
              Medstores Nearby
            </Link>
            <Link href="/prescription" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
              Prescription Reader
            </Link>
            <Link href="/tandc" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
              T & C
            </Link>
            <Link href="/availability" className="bg-white text-black block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-200">
              Check Availability
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;