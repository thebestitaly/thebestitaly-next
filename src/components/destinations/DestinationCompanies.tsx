"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail, ExternalLink, Building2, Star } from "lucide-react";
import directusWebClient from "@/lib/directus-web";
import { getOptimizedImageUrl } from "@/lib/imageUtils";

interface DestinationCompaniesProps {
  destinationId: string;
  destinationType: "region" | "province" | "municipality";
  lang: string;
  destinationName?: string;
}

const DestinationCompanies: React.FC<DestinationCompaniesProps> = ({
  destinationId,
  destinationType,
  lang,
  destinationName = "questa destinazione"
}) => {
  // Debug logging
  React.useEffect(() => {
    console.log('🔍 DestinationCompanies props:', { 
      destinationId, 
      destinationType, 
      lang, 
      typeOfDestinationId: typeof destinationId,
      destinationIdValue: destinationId 
    });
  }, [destinationId, destinationType, lang]);

  const { data: companies, isLoading, error } = useQuery({
    queryKey: ["destination-companies", destinationId, lang],
    queryFn: async () => {
      // Assicuriamoci che destinationId sia una stringa
      const idString = String(destinationId);
      console.log('🔧 Converting destinationId to string:', { original: destinationId, converted: idString });
      
      const result = await directusWebClient.getCompanies({
        destination_id: idString,
        lang: lang
      });
      return result;
    },
    enabled: !!destinationId && typeof destinationId !== 'undefined',
  });

  // Log per debugging
  React.useEffect(() => {
    if (error) {
      console.error('❌ DestinationCompanies query error:', error);
    }
  }, [error]);

  if (isLoading) {
    return (
      <div className="my-12">
        <div className="flex items-center mb-8">
          <Building2 className="mr-3 text-blue-600" size={28} />
          <h2 className="text-3xl font-bold text-gray-900">Punti di Interesse</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="aspect-[3/2] bg-gray-200"></div>
                <div className="p-3 md:p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-12">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 md:p-8 text-center">
          <Building2 className="mx-auto mb-4 text-red-400" size={48} />
          <h3 className="text-xl font-semibold text-red-800 mb-2">Errore nel caricamento</h3>
          <p className="text-red-600">
            Non è possibile caricare i punti di interesse al momento
          </p>
          <p className="text-red-500 text-sm mt-2">
            {error.message || 'Errore sconosciuto'}
          </p>
        </div>
      </div>
    );
  }

  // Ensure companies is always an array
  const companiesArray = Array.isArray(companies) ? companies : [];

  if (!companiesArray?.length) {
    return null;
  }

  return (
    <div className="my-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              POI
            </h2>
            <p className="text-gray-600 mt-1">
              {destinationType === 'region' ? 'Scopri le eccellenze della regione' : 
               destinationType === 'province' ? 'Le migliori aziende della provincia' : 
               'Punti di interesse locali'}
            </p>
          </div>
        </div>
        <div className="bg-blue-100 text-blue-800 text-sm font-semibold px-4 py-2 rounded-full">
          {companiesArray.length} {companiesArray.length === 1 ? 'azienda' : 'aziende'}
        </div>
      </div>

      {/* Grid delle companies */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        {companiesArray.map((company: any) => {
          const translation = company.translations?.[0];

          return (
            <div
              key={company.id}
              className="group rounded-xl border border-gray-100 transition-all duration-300 overflow-hidden"
            >
              {/* Company Image - More compact horizontal format */}
              <div className="relative aspect-[3/2] overflow-hidden  rounded-xl">
                {company.featured_image ? (
                  <Image
                    src={getOptimizedImageUrl(company.featured_image, 'CARD')}
                    alt={company.company_name}
                    loading="lazy"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    unoptimized={true}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                    <Building2 className="text-gray-400" size={28} />
                  </div>
                )}
                
                {/* Featured Badge */}
                {company.featured && (
                  <div className="absolute top-2 left-2">
                    <div className="bg-white/90 backdrop-blur-sm text-yellow-600 px-2 py-1 rounded-md text-xs font-medium flex items-center">
                      <Star className="mr-1" size={10} />
                      Eccellenza
                    </div>
                  </div>
                )}
              </div>

              {/* Company Info */}
              <div className="p-2 md:p-3">
                {company.slug_permalink ? (
                  <Link href={`/${lang}/poi/${company.slug_permalink}`}>
                    <h3 className="text-base md:text-xl font-medium text-gray-900 mb-1.5 group-hover:text-blue-600 transition-colors line-clamp-2 cursor-pointer leading-tight">
                      {company.company_name}
                    </h3>
                  </Link>
                ) : (
                  <h3 className="text-base md:text-lg font-medium text-gray-900 mb-1.5 line-clamp-2 leading-tight">
                    {company.company_name}
                  </h3>
                )}
                
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

      {/* View All Link */}
      <div className="text-center mt-10">
        <Link
          href={`/${lang}/poi`}
          className="inline-flex items-center px-8 py-3 text-white font-semibold rounded-xl transition-colors hover:opacity-90"
          style={{ backgroundColor: '#0066cc' }}
        >
          <Building2 className="mr-2" size={20} />
          Esplora tutte le eccellenze
        </Link>
      </div>
    </div>
  );
};

export default DestinationCompanies; 