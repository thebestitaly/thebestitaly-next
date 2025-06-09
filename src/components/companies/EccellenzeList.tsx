"use client";
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, Globe } from 'lucide-react';
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento eccellenze italiane...</p>
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
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-amber-900 via-amber-800 to-orange-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl lg:text-7xl font-black mb-6">
            🏆 Eccellenze
          </h1>
          <h2 className="text-2xl lg:text-3xl font-light mb-8 opacity-90">
            Le Migliori Esperienze Italiane
          </h2>
          <p className="text-xl max-w-3xl mx-auto opacity-80 leading-relaxed">
            Scopri una selezione curata delle migliori eccellenze italiane: 
            hotel di lusso, ristoranti stellati, esperienze autentiche e attività uniche 
            che rendono l'Italia un paese straordinario.
          </p>
        </div>
      </div>

      {/* Companies Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {companies.map((company: any) => {
            const translation = company.translations?.[0];
            return (
              <div
                key={company.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                {/* Company Image */}
                <div className="relative h-64 bg-gradient-to-br from-amber-100 to-amber-200">
                  {company.featured_image ? (
                    <Image
                      src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${company.featured_image}`}
                      alt={company.company_name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-6xl">
                      🏢
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  
                  {/* Company Name Overlay */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-white text-xl font-bold leading-tight">
                      {company.company_name}
                    </h3>
                  </div>
                </div>

                {/* Company Details */}
                <div className="p-6">
                  {/* SEO Title */}
                  {translation?.seo_title && (
                    <p className="text-amber-600 font-medium mb-3">
                      {translation.seo_title}
                    </p>
                  )}

                  {/* Description */}
                  {translation?.seo_summary && (
                    <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                      {translation.seo_summary}
                    </p>
                  )}

                  {/* Contact Info */}
                  <div className="space-y-2 mb-6">
                    {company.website && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Globe className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{company.website.replace(/^https?:\/\//, '')}</span>
                      </div>
                    )}
                    {company.email && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{company.email}</span>
                      </div>
                    )}
                    {company.phone && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{company.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    {company.slug_permalink ? (
                      <Link
                        href={`/${lang}/eccellenze/${company.slug_permalink}/`}
                        className="flex-1 bg-amber-600 text-white text-center py-2 px-4 rounded-lg hover:bg-amber-700 transition-colors duration-200 font-medium"
                      >
                        Scopri di più
                      </Link>
                    ) : (
                      <div className="flex-1 bg-gray-400 text-white text-center py-2 px-4 rounded-lg font-medium cursor-not-allowed">
                        Link non disponibile
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
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