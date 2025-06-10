"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { Search, X, Menu, ChevronDown } from 'lucide-react';
import directusClient, { getTranslations } from '../../lib/directus';
import { useTranslation } from 'react-i18next';
import InteractiveMap from './InteractiveMap';

interface HeaderProps {
  lang: string;
}

const Header: React.FC<HeaderProps> = ({ lang }) => {
  const { t, i18n } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showDestinations, setShowDestinations] = useState(false);
  const [showMagazine, setShowMagazine] = useState(false);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  // Query per le traduzioni del menu
  const { data: menuTranslations } = useQuery({
    queryKey: ['translations', lang, 'menu'],
    queryFn: () => getTranslations(lang, 'menu'),
  });

  // Query per le destinazioni
  const { data: destinations } = useQuery({
    queryKey: ['destinations', 'region', lang],
    queryFn: () => directusClient.getDestinationsByType('region', lang),
  });

  // Query per le categorie
  const { data: categories } = useQuery({
    queryKey: ['categories', lang],
    queryFn: () => directusClient.getCategories(lang),
  });

  // Gestione scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cambio lingua
  useEffect(() => {
    if (lang && lang !== i18n.language) {
      i18n.changeLanguage(lang);
    }
  }, [lang, i18n]);

  return (
    <header className={`sticky top-0 bg-white z-50 transition-all duration-300 ${isScrolled ? 'h-18' : 'h-20'}`}>
      <div className="border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className={`flex items-center justify-between transition-all duration-300 ${isScrolled ? 'h-18' : 'h-20'}`}>
            {/* Logo */}
            <Link href={lang ? `/${lang}/` : "/"} className="flex-shrink-0">
            <Image
              src="/images/logo-black.webp"
              alt={`The Best Italy ${lang}`}
              width={48}
              height={48}
              style={{ width: "48px", height: "48px" }}
              className="w-12 h-12"
              priority
            />
            </Link>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex h-full">
              {/* Destinations Dropdown */}
              <div
                className="relative h-full"
                onMouseEnter={() => setShowDestinations(true)}
                onMouseLeave={() => setShowDestinations(false)}
              >
                <button className={`h-full flex items-center px-6 text-gray-700 hover:text-blue-600 transition-all duration-300 ${isScrolled ? 'text-base' : 'text-lg'}`}>
                  {menuTranslations?.destinations || 'Destinations'}
                  <ChevronDown size={18} className="ml-1" />
                </button>

                {showDestinations && destinations && (
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 bg-white rounded-2xl border border-gray-100 min-w-[900px]">
                    <div className="p-6">
                      <div className="grid grid-cols-4 gap-1">
                        {destinations.map((destination) => {
                          const translation = destination.translations?.[0];
                          if (!translation?.slug_permalink) return null;
                          
                          const regionSlug = translation.slug_permalink;
                          const isHovered = hoveredRegion === regionSlug;
                  
                          return (
                            <Link
                              key={destination.id}
                              href={`/${lang}/${translation.slug_permalink}/`}
                              className={`group block rounded-xl transition-all duration-200 ${
                                isHovered 
                                  ? 'bg-blue-50' 
                                  : 'hover:bg-gray-50'
                              }`}
                              onMouseEnter={() => setHoveredRegion(regionSlug)}
                              onMouseLeave={() => setHoveredRegion(null)}
                            >
                              <div className="flex items-center space-x-3">
                                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200 flex-shrink-0">
                                  <Image
                                    src={destination.image ? `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${destination.image}` : '/images/map.svg'}
                                    alt={translation.description || translation.destination_name || 'Region'}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className={`text-sm font-medium transition-colors duration-200 ${
                                    isHovered ? 'text-blue-700' : 'text-gray-900 group-hover:text-blue-600'
                                  }`}>
                                    {translation.description || translation.destination_name}
                                  </h3>
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Magazine Dropdown */}
              <div
                className="relative h-full"
                onMouseEnter={() => setShowMagazine(true)}
                onMouseLeave={() => setShowMagazine(false)}
              >
                <Link
                  href={`/${lang}/magazine/`}
                  className={`h-full flex items-center px-6 text-gray-700 hover:text-blue-600 transition-all duration-300 ${isScrolled ? 'text-base' : 'text-lg'}`}
                >
                  {menuTranslations?.magazine || 'Magazine'}
                  <ChevronDown size={18} className="ml-1" />
                </Link>

                {showMagazine && categories && (
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 bg-white rounded-2xl border border-gray-100 mt-[1px] min-w-[1000px]">
                    <div className="grid grid-cols-4 gap-2 p-6">
                      {categories.map((category) => {
                        const translation = category.translations?.[0];
                        if (!translation?.slug_permalink) return null;

                        return (
                          <Link
                            key={category.id}
                            href={`/${lang}/magazine/c/${translation.slug_permalink}/`}
                            className="group block text-center space-y-3 p-2 rounded-xl hover:bg-gray-50 transition-all duration-300"
                          >
                            <div className="relative h-28 w-full mx-auto rounded-xl overflow-hidden">
                              <Image
                                src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${category.image}`}
                                alt={translation.nome_categoria}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                            <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                              {translation.nome_categoria}
                            </h3>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Eccellenze Link */}
              <Link
                href={`/${lang}/eccellenze`}
                className={`h-full flex items-center px-6 text-gray-700 hover:text-blue-600 transition-all duration-300 ${isScrolled ? 'text-base' : 'text-lg'}`}
              >
                Eccellenze
              </Link>

              {/* Experience Link */}
              <Link
                href={`/${lang}/experience`}
                className={`h-full flex items-center px-6 text-gray-700 hover:text-blue-600 transition-all duration-300 ${isScrolled ? 'text-base' : 'text-lg'}`}
              >
                {menuTranslations?.experience_menu || 'Experience'}
              </Link>

              {/* Useful Information Link - Changed from dropdown to direct link */}
              <Link
                href={`/${lang}/magazine/c/useful-information/`}
                className={`h-full flex items-center px-6 text-gray-700 hover:text-blue-600 transition-all duration-300 ${isScrolled ? 'text-base' : 'text-lg'}`}
              >
                {menuTranslations?.useful_informations || 'Informazioni'}
              </Link>

              {/* Search Button */}
              <div className="h-full flex items-center px-6">
                <button
                  className="p-2"
                  onClick={() => setIsSearchOpen(true)}
                  aria-label="Open search"
                >
                  <Search size={24} />
                </button>
              </div>

              
              {/* Language Selector */}
              <div className="h-full flex items-center px-6">
                <button
                  className="flex items-center space-x-2"
                  onClick={() => {
                    document.getElementById('languages')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <Image
                    src={`/images/flags/${lang}.svg`}
                    alt={lang.toUpperCase()}
                    width={24}
                    height={18}
                    className="rounded"
                  />
                  <span className={`ml-2 transition-all duration-300 ${isScrolled ? 'text-base' : 'text-lg'}`}>
                    {lang.toUpperCase()}
                  </span>
                </button>
              </div>
            </nav>

            {/* Mobile Menu */}
            <div
              className={`fixed inset-0 bg-white z-50 transform transition-transform duration-300 md:hidden ${
                isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
              } overflow-y-auto`}
            >
              {/* Mobile Menu Content */}
              <div className="sticky top-0 bg-white z-10">
                <div className="h-20 border-b border-gray-100 flex items-center justify-between px-4">
                  <Link href={lang ? `/${lang}/` : "/"} className="flex-shrink-0">
                  <Image
                    src="/images/logo-black.webp"
                    alt={`The Best Italy ${lang}`}
                    width={48}
                    height={48}
                    style={{ width: "48px", height: "48px" }}
                    className="w-12 h-12"
                    priority
                  />

                  </Link>
                  <div className="flex items-center space-x-4">
                    <button
                      className="p-2"
                      onClick={() => setIsSearchOpen(true)}
                      aria-label="Open search"
                    >
                      <Search size={24} />
                    </button>
                    <button
                      className="p-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                      aria-label="Close menu"
                    >
                      <X size={24} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 pb-20">
                {/* Mobile Menu Items */}
                <div className="space-y-4">
                  {/* Destinations */}
                  <div>
                    <button
                      className="w-full text-left px-4 py-2 text-lg font-medium flex justify-between items-center"
                      onClick={() => setShowDestinations(!showDestinations)}
                    >
                      {menuTranslations?.destinations || 'Destinations'}
                      <ChevronDown
                        size={20}
                        className={`transform transition-transform ${showDestinations ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {showDestinations && destinations && (
                      <div className="pl-8 space-y-2">
                        {destinations.map((destination) => {
                          const translation = destination.translations?.[0];
                          if (!translation?.slug_permalink || !lang) return null;

                          return (
                            <Link
                              key={destination.id}
                              href={`/${lang}/${translation.slug_permalink}/`}
                              className="block py-1 text-gray-600"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              {translation.description || translation.destination_name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Magazine */}
                  {/* Magazine Section */}
                  <div>
                    <button
                      className="w-full text-left px-4 py-2 text-lg font-medium flex justify-between items-center"
                      onClick={() => setShowMagazine(!showMagazine)}
                    >
                      {menuTranslations?.magazine || 'Magazine'}
                      <ChevronDown
                        size={20}
                        className={`transform transition-transform ${showMagazine ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {showMagazine && categories && (
                      <div className="pl-8 space-y-2">
                        {categories.map((category) => {
                          const translation = category.translations?.[0];
                          if (!translation?.slug_permalink || !lang) return null;

                          return (
                            <Link
                              key={category.id}
                              href={`/${lang}/magazine/c/${translation.slug_permalink}/`}
                              className="block py-1 text-gray-600"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              {translation.nome_categoria}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Eccellenze */}
                  <Link
                    href={`/${lang}/eccellenze`}
                    className="block px-4 py-2 text-lg font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Eccellenze
                  </Link>

                  {/* Experience Link */}
                  <Link
                    href={`/${lang}/experience`}
                    className="block px-4 py-2 text-lg font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {menuTranslations?.experience_menu || 'Experience'}
                  </Link>

                  {/* Useful Information - Changed to direct link in mobile */}
                  <Link
                    href={`/${lang}/magazine/c/useful-information/`}
                    className="block px-4 py-2 text-lg font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {menuTranslations?.useful_informations || 'Informazioni'}
                  </Link>

                  {/* Language Selector */}
                  <div className="px-4 py-2">
                    <button
                    className="flex items-center text-lg font-medium"
                    onClick={() => {
                      document.getElementById('languages')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                      <Image
                        src={`/images/flags/${lang}.svg`}
                        alt={lang.toUpperCase()}
                        width={24}
                        height={18}
                        className="rounded mr-2"
                      />
                      {lang.toUpperCase()}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;