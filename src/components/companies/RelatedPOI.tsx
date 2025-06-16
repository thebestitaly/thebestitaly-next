"use client";
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, ExternalLink } from 'lucide-react';
import directusClient from '../../lib/directus';

interface RelatedPOIProps {
  currentCompanyId: number;
  destinationId: number;
  lang: string;
}

interface Company {
  id: number;
  company_name: string;
  website?: string;
  featured_image?: string;
  slug_permalink?: string;
  destination_id: number;
  translations: {
    seo_title?: string;
    seo_summary?: string;
  }[];
}

interface Destination {
  id: string;
  type: 'region' | 'province' | 'municipality';
  region_id?: string;
  province_id?: string;
  translations: {
    destination_name: string;
  }[];
}

export default function RelatedPOI({ currentCompanyId, destinationId, lang }: RelatedPOIProps) {
  
  // Fetch destination info to understand the hierarchy
  const { data: currentDestination } = useQuery({
    queryKey: ['destination', destinationId, lang],
    queryFn: async () => {
      const destination = await directusClient.getDestinationById(destinationId.toString(), lang);
      return destination;
    }
  });

  // Fetch companies in the same destination (city/province)
  const { data: sameDestinationCompanies } = useQuery({
    queryKey: ['companies-same-destination', destinationId, lang],
    queryFn: async () => {
      const companies = await directusClient.getCompaniesByDestination(
        destinationId.toString(), 
        lang, 
        currentDestination?.type || 'municipality'
      );
      return companies.filter((company: Company) => company.id !== currentCompanyId);
    },
    enabled: !!currentDestination
  });

  // Fetch companies in the same region if not enough in the same destination
  const { data: sameRegionCompanies } = useQuery({
    queryKey: ['companies-same-region', currentDestination?.region_id, lang],
    queryFn: async () => {
      if (!currentDestination?.region_id) return [];
      
      const companies = await directusClient.getCompaniesByDestination(
        currentDestination.region_id.toString(), 
        lang, 
        'region'
      );
      return companies.filter((company: Company) => 
        company.id !== currentCompanyId && 
        company.destination_id !== destinationId
      );
    },
    enabled: !!currentDestination?.region_id && (sameDestinationCompanies?.length || 0) < 3
  });

  // Combine and limit results
  const allRelatedCompanies = [
    ...(sameDestinationCompanies || []),
    ...(sameRegionCompanies || [])
  ].slice(0, 6);

  const buildCompanyUrl = (company: Company) => {
    if (company.slug_permalink) {
      return `/${lang}/poi/${company.slug_permalink}/`;
    }
    
    const generatedSlug = company.company_name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    return generatedSlug ? `/${lang}/poi/${generatedSlug}/` : '#';
  };

  if (!allRelatedCompanies.length) {
    return null;
  }

  return (
    <div className="rounded-xl md:rounded-2xl bg-blue-50 p-4">
      <div className="flex items-center mb-4">
        <MapPin className="w-5 h-5 text-blue-600 mr-2" />
        <h3 className="text-lg font-bold text-gray-900">
          Altri POI nelle vicinanze
        </h3>
      </div>
      
      <div className="space-y-4">
        {allRelatedCompanies.map((company: Company) => {
          const translation = company.translations?.[0];
          
          return (
            <Link
              key={company.id}
              href={buildCompanyUrl(company)}
              className="block group"
            >
              <div className="flex space-x-3 p-3 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200">
                {/* Image */}
                <div className="flex-shrink-0 w-32 h-24 relative rounded-lg overflow-hidden bg-gray-200">
                  {company.featured_image ? (
                    <Image
                      src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${company.featured_image}?width=200&height=150&fit=cover`}
                      alt={company.company_name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                      sizes="128px"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <span className="text-gray-500 text-xs">POI</span>
                    </div>
                  )}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {company.company_name}
                  </h4>
                  
                  {translation?.seo_title && (
                    <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                      {translation.seo_title}
                    </p>
                  )}
                  
                  {translation?.seo_summary && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {translation.seo_summary}
                    </p>
                  )}
                </div>
                
                {/* Arrow */}
                <div className="flex-shrink-0 flex items-center">
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      
      {/* Show location context */}
      {currentDestination && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-600">
            {sameDestinationCompanies?.length > 0 && (
              <span className="inline-block mr-2">
                {sameDestinationCompanies.length} in {currentDestination.translations?.[0]?.destination_name}
              </span>
            )}
            {sameRegionCompanies?.length > 0 && (
              <span className="inline-block">
                {sameRegionCompanies.length} nella regione
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
} 