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
      const result = await directusClient.getCompanies(lang, {
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
        <div className="relative h-96 lg:h-[500px]">
          <div className="absolute inset-0 m-10">
            <Image
              src="https://directus-production-93f0.up.railway.app/assets/8782334a-2aa5-40be-87d0-960d8e79e7ff?cache-buster=2025-06-10T15:39:16.782Z&key=system-large-contain"
              alt="Eccellenze Italiane"
              fill
              className="object-cover rounded-2xl"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent rounded-2xl" />
          </div>
          <div className="relative z-10 h-full flex items-end">
            <div className="container mx-auto px-4 pb-12">             
              <div className="max-w-4xl">
                <h1 className="text-4xl lg:text-6xl font-black text-white leading-none mb-4">
                  🏆 Eccellenze
                </h1>
                <h2 className="text-xl lg:text-2xl font-light text-white/90 mb-6 leading-relaxed">
                  Le Migliori Esperienze Italiane
                </h2>
                <p className="text-lg text-white/80 max-w-3xl leading-relaxed">
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
      {/* Hero Section */}
      <div className="relative h-96 lg:h-[500px]">
        <div className="absolute inset-0 m-10">
          <Image
            src="https://directus-production-93f0.up.railway.app/assets/8782334a-2aa5-40be-87d0-960d8e79e7ff?cache-buster=2025-06-10T15:39:16.782Z&key=system-large-contain"
            alt="Eccellenze Italiane"
            fill
            className="object-cover rounded-2xl"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent rounded-2xl" />
        </div>
        <div className="relative z-10 h-full flex items-end">
          <div className="container mx-auto px-4 pb-12">             
            <div className="max-w-4xl">
              <h1 className="text-4xl lg:text-6xl font-black text-white leading-none mb-4">
                🏆 Eccellenze
              </h1>
              <h2 className="text-xl lg:text-2xl font-light text-white/90 mb-6 leading-relaxed">
                Le Migliori Esperienze Italiane
              </h2>
              <p className="text-lg text-white/80 max-w-3xl leading-relaxed">
                Scopri una selezione curata delle migliori eccellenze italiane: 
                hotel di lusso, ristoranti stellati, esperienze autentiche e attività uniche 
                che rendono l'Italia un paese straordinario.
              </p>
            </div>
          </div>        
        </div>
      </div>

      {/* Breadcrumb */}
      <Breadcrumb />

      {/* Companies Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {companies.map((company: any) => {
            const translation = company.translations?.[0];
            const category = categories?.find((cat: any) => cat.id === company.category_id);
            const categoryName = category?.translations?.[0]?.nome_categoria;
            
            return (
              <div key={company.id} className="group">
                {/* Category Tag */}
                {categoryName && (
                  <div className="mb-4">
                    <span className="inline-block bg-amber-100 text-amber-800 text-sm font-semibold px-4 py-2 rounded-full">
                      {categoryName}
                    </span>
                  </div>
                )}
                
                {/* Company Image */}
                <div className="relative aspect-[4/3] mb-8 overflow-hidden rounded-2xl">
                  <Link href={company.slug_permalink ? `/${lang}/eccellenze/${company.slug_permalink}/` : '#'}>
                    {company.featured_image ? (
                      <Image
                        src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${company.featured_image}`}
                        alt={company.company_name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center text-8xl">
                        🏢
                      </div>
                    )}
                  </Link>
                </div>

                {/* Company Name */}
                <Link href={company.slug_permalink ? `/${lang}/eccellenze/${company.slug_permalink}/` : '#'}>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-amber-600 transition-colors duration-200 leading-tight">
                    {company.company_name}
                  </h3>
                </Link>

                {/* SEO Title */}
                {translation?.seo_title && (
                  <p className="text-amber-600 font-medium text-lg">
                    {translation.seo_title}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Vuoi promuovere la tua eccellenza?
            </h3>
            <p className="text-gray-600 mb-6 text-sm">
              Unisciti alle migliori eccellenze italiane presenti su TheBestItaly
            </p>
            <Link
              href={`/${lang}/contact`}
              className="inline-block bg-amber-600 text-white px-8 py-3 rounded-lg hover:bg-amber-700 transition-colors duration-200 font-semibold"
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