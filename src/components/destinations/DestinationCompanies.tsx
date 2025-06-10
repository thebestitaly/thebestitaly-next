"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail, ExternalLink, Building2, Star } from "lucide-react";
import directusClient from "@/lib/directus";

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
  const { data: companies, isLoading, error } = useQuery({
    queryKey: ["destination-companies", destinationId, lang],
    queryFn: async () => {
      console.log('🔍 Query: Fetching companies for destination:', destinationId);
      const result = await directusClient.getCompaniesByDestination(destinationId, lang, destinationType);
      console.log('📊 Query result:', result?.length || 0, 'companies found');
      return result;
    },
    enabled: !!destinationId,
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="h-48 bg-gray-300"></div>
                <div className="p-6 space-y-3">
                  <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-300 rounded w-full"></div>
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
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <Building2 className="mx-auto mb-4 text-red-400" size={48} />
          <h3 className="text-xl font-bold text-red-800 mb-2">Errore nel caricamento</h3>
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

  if (!companies?.length) {
    return null;
  }

  return (
    <div className="my-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Building2 className="mr-3 text-blue-600" size={28} />
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Punti di Interesse
            </h2>
            <p className="text-gray-600 mt-1">
              {destinationType === 'region' ? 'Scopri le eccellenze della regione' : 
               destinationType === 'province' ? 'Le migliori aziende della provincia' : 
               'Punti di interesse locali'}
            </p>
          </div>
        </div>
        <div className="bg-blue-100 text-blue-800 text-sm font-semibold px-4 py-2 rounded-full">
          {companies.length} {companies.length === 1 ? 'azienda' : 'aziende'}
        </div>
      </div>

      {/* Grid delle companies */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((company: any) => {
          const translation = company.translations?.[0];

          return (
            <div
              key={company.id}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200"
            >
              {/* Company Image */}
              <div className="relative h-48 overflow-hidden">
                {company.featured_image ? (
                  <Image
                    src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${company.featured_image}`}
                    alt={company.company_name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    <Building2 className="text-blue-400" size={48} />
                  </div>
                )}
                
                {/* Featured Badge */}
                {company.featured && (
                  <div className="absolute top-4 left-4">
                    <div className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold flex items-center">
                      <Star className="mr-1" size={12} />
                      Eccellenza
                    </div>
                  </div>
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Company Info */}
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {company.company_name}
                  </h3>
                  
                  {translation?.seo_summary && (
                    <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                      {translation.seo_summary}
                    </p>
                  )}
                </div>

                {/* Contact Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    {company.website && (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                        title="Visita sito web"
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}
                    
                    {company.email && (
                      <a
                        href={`mailto:${company.email}`}
                        className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                        title="Invia email"
                      >
                        <Mail size={16} />
                      </a>
                    )}
                    
                    {company.phone && (
                      <a
                        href={`tel:${company.phone}`}
                        className="p-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors"
                        title="Chiama"
                      >
                        <Phone size={16} />
                      </a>
                    )}
                  </div>

                  {/* Details Link */}
                  {company.slug_permalink && (
                    <Link
                      href={`/${lang}/companies/${company.slug_permalink}`}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center"
                    >
                      Scopri
                      <ExternalLink className="ml-1" size={14} />
                    </Link>
                  )}
                </div>

                {/* Contact Info Footer */}
                {(company.phone || company.email) && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="space-y-1 text-xs text-gray-500">
                      {company.phone && (
                        <div className="flex items-center">
                          <Phone className="mr-2" size={12} />
                          <span>{company.phone}</span>
                        </div>
                      )}
                      {company.email && (
                        <div className="flex items-center">
                          <Mail className="mr-2" size={12} />
                          <span className="truncate">{company.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* View All Link */}
      <div className="text-center mt-10">
        <Link
          href={`/${lang}/companies`}
          className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
        >
          <Building2 className="mr-2" size={20} />
          Esplora tutte le aziende
        </Link>
      </div>
    </div>
  );
};

export default DestinationCompanies; 