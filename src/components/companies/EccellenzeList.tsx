"use client";
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import Breadcrumb from '../layout/Breadcrumb';
import directusClient from '../../lib/directus';

interface EccellenzeListProps {
  lang: string;
}

const EccellenzeList: React.FC<EccellenzeListProps> = ({ lang }) => {
  // Fetch all active companies
  const { data: companies, isLoading, error } = useQuery({
    queryKey: ['companies-eccellenze', lang],
    queryFn: async () => {
      console.log('🔍 Fetching companies for eccellenze page...');
      const result = await directusClient.getCompaniesForListing(lang, {
        active: { _eq: true }
      });
      console.log('📊 Companies result:', result);
      return result;
    }
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['company-categories', lang],
    queryFn: () => directusClient.getCompanyCategories(lang)
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <div className="relative h-64 sm:h-80 lg:h-[500px]">
          <div className="absolute inset-0 m-4 sm:m-6 lg:m-10">
            <Image
              src="/excellence.webp"
              alt="Eccellenze Italiane"
              fill
              className="object-cover rounded-lg sm:rounded-xl lg:rounded-2xl"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent rounded-lg sm:rounded-xl lg:rounded-2xl" />
          </div>
          <div className="relative z-10 h-full flex items-end">
            <div className="container mx-auto px-4 pb-6 sm:pb-8 lg:pb-12">             
              <div className="max-w-4xl">
                <h1 className="text-2xl sm:text-3xl lg:text-6xl font-black text-white leading-tight mb-2 sm:mb-3 lg:mb-4">
                  🏆 Eccellenze
                </h1>
                <h2 className="text-base sm:text-lg lg:text-2xl font-light text-white/90 mb-3 sm:mb-4 lg:mb-6 leading-relaxed">
                  Le Migliori Esperienze Italiane
                </h2>
                <p className="text-sm sm:text-base lg:text-lg text-white/80 max-w-3xl leading-relaxed">
                  Scopri una selezione curata delle migliori eccellenze italiane: 
                  hotel di lusso, ristoranti stellati, esperienze autentiche e attività uniche 
                  che rendono l'Italia un paese straordinario.
                </p>
              </div>
            </div>        
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Caricamento eccellenze italiane...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center text-red-600">
          <h2 className="text-2xl font-bold mb-4">Errore nel caricamento</h2>
          <p>Non è stato possibile caricare le eccellenze.</p>
        </div>
      </div>
    );
  }

  if (!companies?.length) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Eccellenze Italiane</h2>
          <p className="text-gray-600">Al momento non ci sono eccellenze disponibili.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Header - Studenti.it style */}
      <div className="md:hidden">
        <div className="px-4 pt-6 pb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            🏆 Eccellenze
          </h1>
          <p className="text-base text-gray-600 mb-4">
            Le Migliori Esperienze Italiane
          </p>
          
          {/* Hero Image - Mobile */}
          <div className="relative aspect-[16/9] mb-4 overflow-hidden rounded-xl">
            <Image
              src="/excellence.webp"
              alt="Eccellenze Italiane"
              fill
              className="object-cover"
              priority
            />
          </div>
          
          {/* TOC - Table of Contents */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">In questa pagina:</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#eccellenze-list" className="text-blue-600 hover:text-blue-800">
                  • Tutte le eccellenze
                </a>
              </li>
              <li>
                <a href="#categories" className="text-blue-600 hover:text-blue-800">
                  • Categorie disponibili
                </a>
              </li>
              <li>
                <a href="#join-us" className="text-blue-600 hover:text-blue-800">
                  • Unisciti a noi
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Desktop Hero Section */}
      <div className="hidden md:block relative h-64 sm:h-80 lg:h-[500px]">
        <div className="absolute inset-0 m-4 sm:m-6 lg:m-10">
          <Image
            src="/excellence.webp"
            alt="Eccellenze Italiane"
            fill
            className="object-cover rounded-lg sm:rounded-xl lg:rounded-2xl"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent rounded-lg sm:rounded-xl lg:rounded-2xl" />
        </div>
        <div className="relative z-10 h-full flex items-end">
          <div className="container mx-auto px-4 pb-6 sm:pb-8 lg:pb-12">             
            <div className="max-w-4xl">
              <h1 className="text-2xl sm:text-3xl lg:text-6xl font-black text-white leading-tight mb-2 sm:mb-3 lg:mb-4">
                🏆 Eccellenze
              </h1>
              <h2 className="text-base sm:text-lg lg:text-2xl font-light text-white/90 mb-3 sm:mb-4 lg:mb-6 leading-relaxed">
                Le Migliori Esperienze Italiane
              </h2>
              <p className="text-sm sm:text-base lg:text-lg text-white/80 max-w-3xl leading-relaxed">
                Scopri una selezione curata delle migliori eccellenze italiane: 
                hotel di lusso, ristoranti stellati, esperienze autentiche e attività uniche 
                che rendono l'Italia un paese straordinario.
              </p>
            </div>
          </div>        
        </div>
      </div>

      {/* Breadcrumb - Desktop only */}
      <div className="hidden md:block">
        <Breadcrumb />
      </div>

      {/* Companies Grid */}
      <div id="eccellenze-list" className="container mx-auto px-4 py-8 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-12">
          {companies.map((company: any) => {
            const translation = company.translations?.[0];
            const category = categories?.find((cat: any) => cat.id === company.category_id);
            const categoryName = category?.translations?.[0]?.nome_categoria;
            
            return (
              <div key={company.id} className="group">
                {/* Category Tag */}
                {categoryName && (
                  <div className="mb-2 md:mb-4">
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs md:text-sm font-semibold px-3 md:px-4 py-1 md:py-2 rounded-full">
                      {categoryName}
                    </span>
                  </div>
                )}
                
                {/* Company Image */}
                <div className="relative aspect-[4/3] mb-3 md:mb-8 overflow-hidden rounded-xl md:rounded-2xl">
                  <Link href={company.slug_permalink ? `/${lang}/poi/${company.slug_permalink}/` : '#'}>
                    {company.featured_image ? (
                      <Image
                        src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${company.featured_image}`}
                        alt={company.company_name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-4xl md:text-8xl">
                        🏢
                      </div>
                    )}
                  </Link>
                </div>

                {/* Company Name */}
                <Link href={company.slug_permalink ? `/${lang}/poi/${company.slug_permalink}/` : '#'}>
                  <h3 className="text-lg md:text-2xl font-bold text-gray-900 mb-2 md:mb-3 group-hover:text-blue-600 transition-colors duration-200 leading-tight">
                    {company.company_name}
                  </h3>
                </Link>

                {/* SEO Title */}
                {translation?.seo_title && (
                  <p className="text-blue-600 font-medium text-sm md:text-lg">
                    {translation.seo_title}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div id="join-us" className="mt-8 md:mt-16 text-center">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4">
              Vuoi promuovere la tua eccellenza?
            </h3>
            <p className="text-gray-600 mb-4 md:mb-6 text-sm">
              Unisciti alle migliori eccellenze italiane presenti su TheBestItaly
            </p>
            <Link
              href={`/it/landing`}
              className="inline-block text-white px-8 py-3 rounded-lg transition-colors duration-200 font-semibold hover:opacity-90"
              style={{ backgroundColor: '#0066cc' }}
            >
              Contattaci
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EccellenzeList; 