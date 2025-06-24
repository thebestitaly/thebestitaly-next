"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { Search, X, Menu, ChevronDown } from 'lucide-react';
import directusClient from '../../lib/directus';
import { useSectionTranslations } from '@/hooks/useTranslations';
import InteractiveMap from './InteractiveMap';

interface HeaderProps {
  lang: string;
}

const Header: React.FC<HeaderProps> = ({ lang }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showDestinations, setShowDestinations] = useState(false);
  const [showMagazine, setShowMagazine] = useState(false);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);

  // Hook per le traduzioni del menu con il nuovo sistema
  const { translations: menuTranslations, loading: menuLoading } = useSectionTranslations('menu', lang);

  // Query per le destinazioni con cache aggressiva (1 anno)
  const { data: destinations } = useQuery({
    queryKey: ['menu-destinations', 'region', lang],
    queryFn: () => directusClient.getDestinationsByType('region', lang),
    staleTime: 1000 * 60 * 60 * 24 * 30, // 30 giorni client-side
    gcTime: 1000 * 60 * 60 * 24 * 365, // 1 anno in memoria
  });

  // Query per le categorie con cache aggressiva
  const { data: categories } = useQuery({
    queryKey: ['menu-categories', lang],
    queryFn: () => directusClient.getCategories(lang),
    staleTime: 1000 * 60 * 60 * 24 * 7, // 7 giorni client-side
    gcTime: 1000 * 60 * 60 * 24 * 180, // 6 mesi in memoria
  });

  // Gestione scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Language options for desktop (only main ones)
  const mainLanguages = [
    { code: 'it', name: 'Italiano', flag: 'it' },
    { code: 'en', name: 'English', flag: 'en' },
    { code: 'fr', name: 'Français', flag: 'fr' },
    { code: 'es', name: 'Español', flag: 'es' },
    { code: 'pt', name: 'Português', flag: 'pt' },
    { code: 'de', name: 'Deutsch', flag: 'de' },
    { code: 'tr', name: 'Türkçe', flag: 'tr' }
  ];

  // All 50+ languages for mobile modal
  const allLanguages = [
    { code: 'it', name: 'Italiano', flag: 'it' },
    { code: 'en', name: 'English', flag: 'en' },
    { code: 'fr', name: 'Français', flag: 'fr' },
    { code: 'es', name: 'Español', flag: 'es' },
    { code: 'pt', name: 'Português', flag: 'pt' },
    { code: 'de', name: 'Deutsch', flag: 'de' },
    { code: 'tr', name: 'Türkçe', flag: 'tr' },
    { code: 'nl', name: 'Nederlands', flag: 'nl' },
    { code: 'ro', name: 'Română', flag: 'ro' },
    { code: 'sv', name: 'Svenska', flag: 'sv' },
    { code: 'pl', name: 'Polski', flag: 'pl' },
    { code: 'vi', name: 'Tiếng Việt', flag: 'vi' },
    { code: 'id', name: 'Bahasa Indonesia', flag: 'id' },
    { code: 'el', name: 'Ελληνικά', flag: 'el' },
    { code: 'uk', name: 'Українська', flag: 'uk' },
    { code: 'ru', name: 'Русский', flag: 'ru' },
    { code: 'bn', name: 'বাংলা', flag: 'bn' },
    { code: 'zh', name: '中文 (简体)', flag: 'zh' },
    { code: 'hi', name: 'हिन्दी', flag: 'hi' },
    { code: 'ar', name: 'العربية', flag: 'ar' },
    { code: 'fa', name: 'فارسی', flag: 'fa' },
    { code: 'ur', name: 'اردو', flag: 'ur' },
    { code: 'ja', name: '日本語', flag: 'ja' },
    { code: 'ko', name: '한국어', flag: 'ko' },
    { code: 'am', name: 'አማርኛ', flag: 'am' },
    { code: 'cs', name: 'Čeština', flag: 'cs' },
    { code: 'da', name: 'Dansk', flag: 'da' },
    { code: 'fi', name: 'Suomi', flag: 'fi' },
    { code: 'af', name: 'Afrikaans', flag: 'af' },
    { code: 'hr', name: 'Hrvatski', flag: 'hr' },
    { code: 'bg', name: 'Български', flag: 'bg' },
    { code: 'sk', name: 'Slovenčina', flag: 'sk' },
    { code: 'sl', name: 'Slovenščina', flag: 'sl' },
    { code: 'sr', name: 'Српски', flag: 'sr' },
    { code: 'th', name: 'ไทย', flag: 'th' },
    { code: 'ms', name: 'Bahasa Melayu', flag: 'ms' },
    { code: 'tl', name: 'Filipino', flag: 'tl' },
    { code: 'he', name: 'עברית', flag: 'he' },
    { code: 'ca', name: 'Català', flag: 'ca' },
    { code: 'et', name: 'Eesti', flag: 'et' },
    { code: 'lv', name: 'Latviešu', flag: 'lv' },
    { code: 'lt', name: 'Lietuvių', flag: 'lt' },
    { code: 'mk', name: 'Македонски', flag: 'mk' },
    { code: 'az', name: 'Azərbaycan', flag: 'az' },
    { code: 'ka', name: 'ქართული', flag: 'ka' },
    { code: 'hy', name: 'Հայերեն', flag: 'hy' },
    { code: 'is', name: 'Íslenska', flag: 'is' },
    { code: 'sw', name: 'Kiswahili', flag: 'sw' },
    { code: 'zh-tw', name: '中文 (繁體)', flag: 'zh-tw' }
  ];

  const handleLanguageChange = (newLang: string) => {
    const currentPath = window.location.pathname;
    const pathParts = currentPath.split('/');
    pathParts[1] = newLang; // Replace the language part
    const newPath = pathParts.join('/');
    window.location.href = newPath;
    setIsLanguageModalOpen(false);
    setIsMobileMenuOpen(false);
  };

  const headerStyle = { height: '80px' };
  const headerClasses = "sticky top-0 bg-white z-50 h-20 border-b border-gray-100";

  return (
    <header className={headerClasses} style={headerStyle}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20" style={headerStyle}>
            {/* Logo */}
            <Link href={lang ? `/${lang}/` : "/"} className="flex-shrink-0">
            <Image
              src="/images/logo-black.webp"
              alt={`The Best Italy ${lang}`}
              width={105}
              height={60}
              style={{ width: "105px", height: "60px", minWidth: "105px", minHeight: "60px" }}
              className="h-10 w-auto"
              priority
              sizes="105px"
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
                href={`/${lang}/poi`}
                className={`h-full flex items-center px-6 text-gray-700 hover:text-blue-600 transition-all duration-300 ${isScrolled ? 'text-base' : 'text-lg'}`}
              >
                {menuTranslations?.excellence_menu || 'Excellence'}
              </Link>

              {/* Experience Link */}
              <Link
                href={`/${lang}/experience`}
                className={`h-full flex items-center px-6 text-gray-700 hover:text-blue-600 transition-all duration-300 ${isScrolled ? 'text-base' : 'text-lg'}`}
              >
                {menuTranslations?.experience_menu || 'Experience'}
              </Link>

              {/* Useful Information Link */}
              <Link
                href={`/${lang}/magazine/c/useful-information/`}
                className={`h-full flex items-center px-6 text-gray-700 hover:text-blue-600 transition-all duration-300 ${isScrolled ? 'text-base' : 'text-lg'}`}
              >
                {menuTranslations?.useful_informations || 'Informazioni'}
              </Link>

              {/* Language Selector - Desktop: Link to footer */}
              <div className="h-full flex items-center px-6">
                <a
                  href="#languages"
                  className="flex items-center space-x-2 hover:text-blue-600 transition-colors"
                >
                  <Image
                    src={`/images/flags/${lang}.svg`}
                    alt={`${menuTranslations?.menu_language || lang.toUpperCase()} - ${lang.toUpperCase()}`}
                    width={24}
                    height={18}
                    className="rounded w-6 h-[18px] object-cover"
                  />
                  <span className={`ml-2 transition-all duration-300 ${isScrolled ? 'text-base' : 'text-lg'}`}>
                    {lang.toUpperCase()}
                  </span>
                </a>
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
                    width={70}
                    height={40}
                    style={{ width: "70px", height: "40px" }}
                    className="h-10 w-auto"
                  />
                  </Link>
                  <div className="flex items-center space-x-4">
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
                <div className="space-y-4">
                  {/* Mobile Destinations */}
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
                      <div className="mt-2 pl-4 space-y-2">
                        {destinations.map((destination) => {
                          const translation = destination.translations?.[0];
                          if (!translation?.slug_permalink) return null;
                          
                          return (
                            <Link
                              key={destination.id}
                              href={`/${lang}/${translation.slug_permalink}/`}
                              className="block px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              {translation.description || translation.destination_name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Mobile Magazine */}
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
                      <div className="mt-2 pl-4 space-y-2">
                        {categories.map((category) => {
                          const translation = category.translations?.[0];
                          if (!translation?.slug_permalink) return null;

                          return (
                            <Link
                              key={category.id}
                              href={`/${lang}/magazine/c/${translation.slug_permalink}/`}
                              className="block px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              {translation.nome_categoria}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Mobile Direct Links */}
                  <Link
                    href={`/${lang}/poi`}
                    className="block px-4 py-2 text-lg font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {menuTranslations?.excellence_menu || 'Eccellenze'}
                  </Link>

                  <Link
                    href={`/${lang}/experience`}
                    className="block px-4 py-2 text-lg font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {menuTranslations?.experience_menu || 'Experience'}
                  </Link>

                  <Link
                    href={`/${lang}/magazine/c/useful-information/`}
                    className="block px-4 py-2 text-lg font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {menuTranslations?.useful_informations || 'Informazioni'}
                  </Link>

                  {/* Mobile Language Selector */}
                  <div className="px-4 py-2">
                    <button
                      className="flex items-center text-lg font-medium"
                      onClick={() => setIsLanguageModalOpen(true)}
                    >
                      <Image
                        src={`/images/flags/${lang}.svg`}
                        alt={lang.toUpperCase()}
                        width={24}
                        height={18}
                        className="rounded mr-2 w-6 h-[18px] object-cover"
                      />
                      {lang.toUpperCase()}
                    </button>
                  </div>
                </div>
              </div>
            </div>
        </div>
      </div>

      {/* Language Modal */}
      {isLanguageModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Select Language</h3>
              <button
                onClick={() => setIsLanguageModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {allLanguages.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => handleLanguageChange(language.code)}
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                      lang === language.code
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <Image
                      src={`/images/flags/${language.flag}.svg`}
                      alt={language.name}
                      width={20}
                      height={15}
                      className="rounded w-5 h-[15px] object-cover"
                    />
                    <span className="text-sm font-medium truncate">{language.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;