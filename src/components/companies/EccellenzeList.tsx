"use client";
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import Breadcrumb from '../layout/Breadcrumb';
import directusClient, { getTranslations, getPageTitles } from '../../lib/directus';

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

  // Fetch page translations for Eccellenze page
  const { data: pageTranslations } = useQuery({
    queryKey: ['eccellenze-translations', lang],
    queryFn: () => getTranslations(lang, 'eccellenze'),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Fetch page titles from database (ID 3 = eccellenze page)
  const { data: pageTitles } = useQuery({
    queryKey: ['page-titles-eccellenze', lang],
    queryFn: () => getPageTitles(3, lang),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Get dynamic content with language-specific fallbacks (only used if database fails)
  const getFallbacks = (lang: string) => {
    switch (lang) {
      case 'it':
        return {
          title: '🏆 Eccellenze',
          subtitle: 'Le Migliori Esperienze Italiane',
          description: 'Scopri una selezione curata delle migliori eccellenze italiane: hotel di lusso, ristoranti stellati, esperienze autentiche e attività uniche che rendono l\'Italia un paese straordinario.',
          loading: 'Caricamento eccellenze italiane...',
          error_title: 'Errore nel caricamento',
          error_message: 'Non è stato possibile caricare le eccellenze.',
          no_data_title: 'Eccellenze Italiane',
          no_data_message: 'Al momento non ci sono eccellenze disponibili.',
          toc_title: 'In questa pagina:',
          toc_all: '• Tutte le eccellenze',
          toc_categories: '• Categorie disponibili',
          toc_join: '• Unisciti a noi'
        };
      case 'en':
        return {
          title: '🏆 Excellence',
          subtitle: 'The Best Italian Experiences',
          description: 'Discover a curated selection of the best Italian excellence: luxury hotels, starred restaurants, authentic experiences and unique activities that make Italy an extraordinary country.',
          loading: 'Loading Italian excellence...',
          error_title: 'Loading Error',
          error_message: 'Unable to load excellence.',
          no_data_title: 'Italian Excellence',
          no_data_message: 'No excellence available at the moment.',
          toc_title: 'On this page:',
          toc_all: '• All excellence',
          toc_categories: '• Available categories',
          toc_join: '• Join us'
        };
      case 'fr':
        return {
          title: '🏆 Excellence',
          subtitle: 'Les Meilleures Expériences Italiennes',
          description: 'Découvrez une sélection soignée des meilleures excellences italiennes : hôtels de luxe, restaurants étoilés, expériences authentiques et activités uniques qui font de l\'Italie un pays extraordinaire.',
          loading: 'Chargement des excellences italiennes...',
          error_title: 'Erreur de chargement',
          error_message: 'Impossible de charger les excellences.',
          no_data_title: 'Excellence Italienne',
          no_data_message: 'Aucune excellence disponible pour le moment.',
          toc_title: 'Sur cette page:',
          toc_all: '• Toutes les excellences',
          toc_categories: '• Catégories disponibles',
          toc_join: '• Rejoignez-nous'
        };
      case 'de':
        return {
          title: '🏆 Exzellenz',
          subtitle: 'Die Besten Italienischen Erfahrungen',
          description: 'Entdecken Sie eine kuratierte Auswahl der besten italienischen Exzellenz: Luxushotels, Sterne-Restaurants, authentische Erfahrungen und einzigartige Aktivitäten, die Italien zu einem außergewöhnlichen Land machen.',
          loading: 'Italienische Exzellenz wird geladen...',
          error_title: 'Ladefehler',
          error_message: 'Exzellenz konnte nicht geladen werden.',
          no_data_title: 'Italienische Exzellenz',
          no_data_message: 'Momentan ist keine Exzellenz verfügbar.',
          toc_title: 'Auf dieser Seite:',
          toc_all: '• Alle Exzellenz',
          toc_categories: '• Verfügbare Kategorien',
          toc_join: '• Machen Sie mit'
        };
      case 'es':
        return {
          title: '🏆 Excelencia',
          subtitle: 'Las Mejores Experiencias Italianas',
          description: 'Descubre una selección curada de la mejor excelencia italiana: hoteles de lujo, restaurantes con estrellas, experiencias auténticas y actividades únicas que hacen de Italia un país extraordinario.',
          loading: 'Cargando excelencia italiana...',
          error_title: 'Error de carga',
          error_message: 'No se pudo cargar la excelencia.',
          no_data_title: 'Excelencia Italiana',
          no_data_message: 'No hay excelencia disponible en este momento.',
          toc_title: 'En esta página:',
          toc_all: '• Toda la excelencia',
          toc_categories: '• Categorías disponibles',
          toc_join: '• Únete a nosotros'
        };
      default:
        return {
          title: '🏆 Excellence',
          subtitle: 'The Best Italian Experiences',
          description: 'Discover a curated selection of the best Italian excellence: luxury hotels, starred restaurants, authentic experiences and unique activities that make Italy an extraordinary country.',
          loading: 'Loading Italian excellence...',
          error_title: 'Loading Error',
          error_message: 'Unable to load excellence.',
          no_data_title: 'Italian Excellence',
          no_data_message: 'No excellence available at the moment.',
          toc_title: 'On this page:',
          toc_all: '• All excellence',
          toc_categories: '• Available categories',
          toc_join: '• Join us'
        };
    }
  };

  const fallbacks = getFallbacks(lang);
  
  // Use database content first, then translations, then fallbacks
  const pageTitle = pageTitles?.seo_title || pageTitles?.title || pageTranslations?.title || fallbacks.title;
  const pageSubtitle = pageTranslations?.subtitle || fallbacks.subtitle;
  const pageDescription = pageTitles?.seo_summary || pageTranslations?.description || fallbacks.description;
  const loadingText = pageTranslations?.loading || fallbacks.loading;
  const errorTitle = pageTranslations?.error_title || fallbacks.error_title;
  const errorMessage = pageTranslations?.error_message || fallbacks.error_message;
  const noDataTitle = pageTranslations?.no_data_title || fallbacks.no_data_title;
  const noDataMessage = pageTranslations?.no_data_message || fallbacks.no_data_message;
  const tocTitle = pageTranslations?.toc_title || fallbacks.toc_title;
  const tocAllExcellence = pageTranslations?.toc_all || fallbacks.toc_all;
  const tocCategories = pageTranslations?.toc_categories || fallbacks.toc_categories;
  const tocJoinUs = pageTranslations?.toc_join || fallbacks.toc_join;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <div className="relative h-64 sm:h-80 lg:h-[500px]">
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
      {/* Mobile Header - Studenti.it style */}
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
              priority
            />
          </div>
          
          {/* TOC - Table of Contents */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">{tocTitle}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#eccellenze-list" className="text-blue-600 hover:text-blue-800">
                  {tocAllExcellence}
                </a>
              </li>
              <li>
                <a href="#categories" className="text-blue-600 hover:text-blue-800">
                  {tocCategories}
                </a>
              </li>
              <li>
                <a href="#join-us" className="text-blue-600 hover:text-blue-800">
                  {tocJoinUs}
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