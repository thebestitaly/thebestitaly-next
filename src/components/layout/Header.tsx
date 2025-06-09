"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { Search, X, Menu, ChevronDown } from 'lucide-react';
import directusClient, { getTranslations } from '../../lib/directus';
import { useTranslation } from 'react-i18next';

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
  const [showUseful, setShowUseful] = useState(false);

  // Query per le traduzioni del menu
  const { data: menuTranslations } = useQuery({
    queryKey: ['translations', lang, 'menu'],
    queryFn: () => getTranslations(lang, 'menu'),
  });

  // Menu items per informazioni utili
  const usefulMenuItems = [
    { key: 'internet', id: 539 },
    { key: 'restaurants', id: 533 },
    { key: 'shopping', id: 532 },
    { key: 'trains', id: 520 },
    { key: 'airports', id: 521 },
    { key: 'car_rental', id: 519 },
    { key: 'public_transport', id: 518 },
    { key: 'ferries', id: 522 },
    { key: 'currency', id: 527 },
    { key: 'emergency_numbers', id: 524 },
    { key: 'scams', id: 528 }
  ];

  // Query per gli articoli utili
  const { data: usefulArticles } = useQuery({
    queryKey: ['useful-articles', lang],
    queryFn: async () => {
      const response = await directusClient.getArticles(lang, 0, 50, { category_id: 9 });
      return response.articles || []; // Assicurati che sia un array
    },
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

  // Rendering delle voci del menu utili
  const renderUsefulItems = () => {
    if (!usefulArticles || usefulArticles.length === 0) {
      return <p className="text-gray-500">No useful articles available.</p>;
    }
  
    return usefulMenuItems.map(({ key, id }) => {
      const article = usefulArticles.find(a => a.id === String(id));
      if (!article?.translations?.[0]?.slug_permalink) return null;
  
      return (
        <Link
          key={id}
          href={`/${lang}/magazine/${article.translations[0].slug_permalink}`}
          className="block px-4 py-1.5 hover:bg-gray-50 text-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          {menuTranslations[key] || key}
        </Link>
      );
    }).filter(Boolean);
  };

  return (
    <header className={`sticky top-0 bg-white z-50 transition-all duration-300 ${isScrolled ? 'h-18' : 'h-20'}`}>
      <div className="border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className={`flex items-center justify-between transition-all duration-300 ${isScrolled ? 'h-18' : 'h-20'}`}>
            {/* Logo */}
            <Link href={lang ? `/${lang}/` : "/"} className="flex-shrink-0">
            <Image
              src="/images/logo-black.png"
              alt={`The Best Italy ${lang}`}
              width={96}
              height={96}
              style={{ width: "auto", height: "auto" }}
              className="w-12 h-auto" // esempio: cambi dimensioni via Tailwind
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
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 bg-white rounded-2xl shadow-xl border border-gray-100 mt-[1px] min-w-[800px]">
                  <div className="grid grid-cols-3 gap-x-8 p-6">
                    <div className="grid grid-cols-2 col-span-2 gap-y-[2px]">
                      {destinations.map((destination) => {
                        const translation = destination.translations?.[0];
                        if (!translation?.slug_permalink) return null;
                
                        return (
                          <Link
                            key={destination.id}
                            href={`/${lang}/${translation.slug_permalink}/`}
                            className="text-md hover:text-blue-600 transition-colors leading-tight !m-0 !p-0"
                          >
                            {translation.destination_name}
                          </Link>
                        );
                      })}
                    </div>
                    <div className="col-span-1">
                      <div className="rounded-lg overflow-hidden">
                        <Image
                          src="/images/map.svg"
                          alt="Italy Regions"
                          width={300}
                          height={400}
                          className="w-full h-full object-contain"
                        />
                      </div>
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
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 bg-white rounded-2xl shadow-xl border border-gray-100 mt-[1px] min-w-[1000px]">
                    <div className="grid grid-cols-4 gap-6 p-8">
                      {categories.map((category) => {
                        const translation = category.translations?.[0];
                        if (!translation?.slug_permalink) return null;

                        return (
                          <Link
                            key={category.id}
                            href={`/${lang}/magazine/c/${translation.slug_permalink}/`}
                            className="group block text-center space-y-3"
                          >
                            <div className="relative h-24 w-24 mx-auto rounded-full overflow-hidden">
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

              {/* Useful Information Dropdown */}
              <div
                className="relative h-full"
                onMouseEnter={() => setShowUseful(true)}
                onMouseLeave={() => setShowUseful(false)}
              >
                <button className={`h-full flex items-center px-6 text-gray-700 hover:text-blue-600 transition-all duration-300 ${isScrolled ? 'text-base' : 'text-lg'}`}>
                  {menuTranslations?.useful_informations || 'Useful Information'}
                  <ChevronDown size={18} className="ml-1" />
                </button>

                {showUseful && (
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 bg-white rounded-2xl shadow-xl border border-gray-100 mt-[1px] min-w-[300px]">
                    <div className="py-4">
                      {renderUsefulItems()}
                    </div>
                  </div>
                )}
              </div>

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
                    src="/images/logo-black.png"
                    alt={`The Best Italy ${lang}`}
                    width={80}
                    height={80}
                    // Impedisce a Next di lamentarsi, e consenti la riduzione via Tailwind
                    style={{ width: "auto", height: "auto", maxWidth: "100%" }}
                    className="w-12" // Lascio SOLO w-12, rimuovo h-auto
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
                              {translation.destination_name}
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

                  {/* Useful Information Section */}
                  <div>
                    <button
                      className="w-full text-left px-4 py-2 text-lg font-medium flex justify-between items-center"
                      onClick={() => setShowUseful(!showUseful)}
                    >
                      {menuTranslations?.useful_informations || 'Useful Information'}
                      <ChevronDown
                        size={20}
                        className={`transform transition-transform ${showUseful ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {showUseful && (
                      <div className="pl-8 space-y-2">
                        {renderUsefulItems()}
                      </div>
                    )}
                  </div>

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