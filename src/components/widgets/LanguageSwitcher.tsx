"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import directusClient from '../../lib/directus';

interface Language {
  code: string;
  name: string;
  direction: string;
}

const LanguageSwitcher: React.FC = () => {
  const params = useParams();
  const pathname = usePathname();
  const currentLang = (params?.lang as string) || 'it';

  const { data: languages, isLoading, error } = useQuery<Language[]>({
    queryKey: ['languages'],
    queryFn: async () => {
      try {
        const response = await directusClient.get('/items/languages', {
          params: {
            sort: ['name'],
            fields: ['code', 'name', 'direction']
          }
        });
        return response.data.data;
      } catch (err) {
        console.error('Error fetching languages:', err);
        throw err;
      }
    }
  });

  const getCurrentPath = () => {
    const pathParts = pathname.split('/');
    pathParts.splice(1, 1); // Rimuove il codice lingua corrente
    return pathParts.join('/') || '';
  };

  if (!languages) return null;

  return (
    <div className="max-w-7xl mx-auto py-8" id="languages">
      <div className="flex flex-wrap gap-4 justify-center items-center">
        {languages.map((language) => {
          const newPath = `/${language.code}${getCurrentPath()}`;
          const isCurrentLang = currentLang === language.code;

          return (
            <Link
              key={language.code}
              href={newPath}
              className={`flex items-center gap-2 hover:bg-gray-100 rounded-md px-2 py-1 transition-colors duration-200 ${
                isCurrentLang 
                  ? 'bg-gray-100 pointer-events-none' 
                  : 'hover:bg-gray-50'
              }`}
              aria-current={isCurrentLang ? 'page' : undefined}
            >
              <div className="relative w-5 h-5 flex-shrink-0">
                <Image
                  src={`/images/flags/${language.code}.svg`}
                  alt=""
                  fill
                  className="rounded-sm object-cover"
                  sizes="20px"
                />
              </div>
              <span className={`text-sm whitespace-nowrap ${
                isCurrentLang 
                  ? 'text-gray-500' 
                  : 'text-white-900 hover:text-gray-900'
              }`}
                style={{
                  direction: language.direction === 'RTL' ? 'rtl' : 'ltr'
                }}
              >
                {language.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default LanguageSwitcher;