"use client";
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import Breadcrumb from '../layout/Breadcrumb';
import directusClient, { getTranslations, getPageTitles } from '../../lib/directus';
import { getOptimizedImageUrl } from '../../lib/imageUtils';

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
      }, 50); // Limite di 50 companies per la homepage
      console.log('📊 Companies result:', result);
      
      // Triple-check: filter only active companies on client side as well
      // This handles cases where active might be null or undefined
      const activeCompanies = result.filter((company: any) => company.active === true);
      console.log('✅ Active companies only:', activeCompanies.length, 'out of', result.length);
      
      // Log any non-active companies for debugging
      const nonActiveCompanies = result.filter((company: any) => company.active !== true);
      if (nonActiveCompanies.length > 0) {
        console.log('⚠️ Found non-active companies:', nonActiveCompanies.map((c: any) => ({ id: c.id, name: c.company_name, active: c.active })));
      }
      
      return activeCompanies;
    }
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['company-categories', lang],
    queryFn: () => directusClient.getCompanyCategories(lang)
  });

  // Fetch page translations for Eccellenze page
  const { data: pageTranslations } = useQuery({
    queryKey: ['eccellenze-translations', lang],
    queryFn: () => getTranslations(lang, 'eccellenze'),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Fetch page titles from database (ID 3 = eccellenze page)
  const { data: pageTitles } = useQuery({
    queryKey: ['page-titles-eccellenze', lang],
    queryFn: () => getPageTitles('3', lang),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Use database content first, then translations with simple fallbacks
  const pageTitle = pageTitles?.seo_title || pageTitles?.title || pageTranslations?.title || 'Eccellenze';
  const pageSubtitle = pageTranslations?.subtitle || 'Le Migliori Esperienze Italiane';
  const pageDescription = pageTitles?.seo_summary || pageTranslations?.description || 'Scopri le migliori eccellenze italiane';
  const loadingText = pageTranslations?.loading || 'Caricamento...';
  const errorTitle = pageTranslations?.error_title || 'Errore nel caricamento';
  const errorMessage = pageTranslations?.error_message || 'Non è stato possibile caricare le eccellenze.';
  const noDataTitle = pageTranslations?.no_data_title || 'Eccellenze Italiane';
  const noDataMessage = pageTranslations?.no_data_message || 'Al momento non ci sono eccellenze disponibili.';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <div className="relative h-64 sm:h-80 lg:h-[500px]">
                  <div className="absolute inset-0 m-4 sm:m-6 lg:m-10 relative">
          <Image
            src="/images/excellence.webp"
            alt={pageTitle}
            fill
            className="object-cover rounded-lg sm:rounded-xl lg:rounded-2xl"
            sizes="100vw"
            priority
          />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent rounded-lg sm:rounded-xl lg:rounded-2xl" />
          </div>
          <div className="relative z-10 h-full flex items-end">
            <div className="container mx-auto px-4 pb-6 sm:pb-8 lg:pb-12">             
              <div className="max-w-4xl">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 tracking-tighter">
                  {pageTitle}
                </h1>
                <h2 className="text-base sm:text-lg lg:text-2xl font-light text-white/90 mb-3 sm:mb-4 lg:mb-6 leading-relaxed">
                  {pageSubtitle}
                </h2>
                <p className="text-sm sm:text-base lg:text-lg text-white/80 max-w-3xl leading-relaxed">
                  {pageDescription}
                </p>
              </div>
            </div>        
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">{loadingText}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center text-red-600">
          <h2 className="text-2xl font-bold mb-4">{errorTitle}</h2>
          <p>{errorMessage}</p>
        </div>
      </div>
    );
  }

  if (!companies?.length) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{noDataTitle}</h2>
          <p className="text-gray-600">{noDataMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Header - Clean style without TOC */}
      <div className="md:hidden">
        <div className="px-4 pt-6 pb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {pageTitle}
          </h1>
          <p className="text-base text-gray-600 mb-4">
            {pageSubtitle}
          </p>
          
          {/* Hero Image - Mobile */}
          <div className="relative aspect-[16/9] mb-4 overflow-hidden rounded-xl">
            <Image
              src="/images/excellence.webp"
              alt={pageTitle}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
          </div>
        </div>
      </div>

      {/* Desktop Hero Section */}
      <div className="hidden md:block relative h-64 sm:h-80 lg:h-[500px]">
        <div className="absolute inset-0 m-4 sm:m-6 lg:m-10">
          <Image
            src="/images/excellence.webp"
            alt={pageTitle}
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
                {pageTitle}
              </h1>
              <h2 className="text-base sm:text-lg lg:text-2xl font-light text-white/90 mb-3 sm:mb-4 lg:mb-6 leading-relaxed">
                {pageSubtitle}
              </h2>
              <p className="text-sm sm:text-base lg:text-lg text-white/80 max-w-3xl leading-relaxed">
                {pageDescription}
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
        
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {companies.filter((company: any) => company.active === true).map((company: any) => {
            const translation = company.translations?.[0];
            const category = categories?.find((cat: any) => cat.id === company.category_id);
            const categoryName = category?.translations?.[0]?.nome_categoria;
            
            return (
              <div key={company.id} className="group bg-white rounded-xl overflow-hidden hover:border-gray-200 transition-all duration-300 mb-8">
                {/* Company Image - More compact horizontal format */}
                <div className="relative aspect-[3/2] overflow-hidden rounded-xl ">
                  <Link href={company.slug_permalink ? `/${lang}/poi/${company.slug_permalink}/` : '#'}>
                    {company.featured_image ? (
                      <Image
                        src={getOptimizedImageUrl(company.featured_image, 'THUMBNAIL')}
                        alt={company.company_name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                        <div className="text-gray-400 text-xl md:text-2xl">🏢</div>
                      </div>
                    )}
                  </Link>
                  
                  {/* Category Tag - positioned over image */}
                  {categoryName && (
                    <div className="absolute top-2 left-2">
                      <span className="inline-block bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium px-2 py-1 rounded-md">
                        {categoryName}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-3 md:p-4">
                  {/* Company Name */}
                  <Link href={company.slug_permalink ? `/${lang}/poi/${company.slug_permalink}/` : '#'}>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-1.5 group-hover:text-blue-600 transition-colors duration-200 leading-tight line-clamp-2">
                      {company.company_name}
                    </h3>
                  </Link>

                  {/* SEO Title */}
                  {translation?.seo_title && (
                    <p className="text-gray-600 text-xs md:text-sm line-clamp-2 leading-relaxed">
                      {translation.seo_title}
                    </p>
                  )}
                </div>
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