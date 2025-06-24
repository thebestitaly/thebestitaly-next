"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, ChevronDown } from 'lucide-react';

interface HeaderProps {
  lang: string;
}

const Header: React.FC<HeaderProps> = ({ lang }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="sticky top-0 bg-white z-50 transition-all duration-300 header-height border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between transition-all duration-300 header-height">
          {/* Logo con dimensioni fisse per prevenire CLS */}
          <Link href={`/${lang}`} className="flex-shrink-0">
            <Image
              src="/images/logo-black.webp"
              alt={`The Best Italy ${lang}`}
              width={105}
              height={60}
              className="logo-dimensions object-contain"
              priority
              sizes="105px"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href={`/${lang}/destinations`} 
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
            >
              Destinazioni
            </Link>
            <Link 
              href={`/${lang}/poi`} 
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
            >
              Eccellenze
            </Link>
            <Link 
              href={`/${lang}/magazine`} 
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
            >
              Magazine
            </Link>
            <Link 
              href={`/${lang}/experience`} 
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
            >
              Esperienze
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 text-gray-700 hover:text-blue-600 transition-colors duration-200"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 animate-fade-in">
            <nav className="flex flex-col space-y-4">
              <Link 
                href={`/${lang}/destinations`} 
                className="text-gray-700 hover:text-blue-600 font-medium py-2 transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Destinazioni
              </Link>
              <Link 
                href={`/${lang}/poi`} 
                className="text-gray-700 hover:text-blue-600 font-medium py-2 transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Eccellenze
              </Link>
              <Link 
                href={`/${lang}/magazine`} 
                className="text-gray-700 hover:text-blue-600 font-medium py-2 transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Magazine
              </Link>
              <Link 
                href={`/${lang}/experience`} 
                className="text-gray-700 hover:text-blue-600 font-medium py-2 transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Esperienze
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;