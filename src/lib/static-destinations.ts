// Temporary stub file for static-destinations.ts
// Original file disabled due to complex interface issues

import { Destination } from './directus-web';

export async function getProvincesForRegion(regionId: string, lang: string): Promise<Destination[]> {
  console.warn('getProvincesForRegion: using stub implementation');
  return [];
}

export async function getMunicipalitiesForProvince(provinceId: string, lang: string): Promise<Destination[]> {
  console.warn('getMunicipalitiesForProvince: using stub implementation');
  return [];
}

export async function getDestinationDetails(slug: string, lang: string, type: 'region' | 'province' | 'municipality'): Promise<Destination | null> {
  console.warn('getDestinationDetails: using stub implementation');
  return null;
}

export async function generateStaticDestinations(langsToGenerate?: string[]) {
  console.warn('generateStaticDestinations: using stub implementation');
}

export async function invalidateStaticCache(lang?: string) {
  console.warn('invalidateStaticCache: using stub implementation');
}

export async function getStaticCacheStatus(): Promise<Record<string, { exists: boolean; valid: boolean; timestamp?: number }>> {
  console.warn('getStaticCacheStatus: using stub implementation');
  return {};
} 