export const getDirectusImageUrl = (
  assetId: string, 
  options?: {
    width?: number;
    height?: number;
    fit?: 'contain' | 'cover' | 'inside' | 'outside';
    quality?: number;
  }
) => {
  if (!assetId) return '';
  
  // 🚨 EMERGENCY FIX: Use API proxy instead of direct Railway URL to save costs
  const baseUrl = `/api/directus/assets/${assetId}`;
  
  if (!options) return baseUrl;
  
  const params = new URLSearchParams();
  if (options.width) params.append('width', options.width.toString());
  if (options.height) params.append('height', options.height.toString());
  if (options.fit) params.append('fit', options.fit);
  if (options.quality) params.append('quality', options.quality.toString());
  
  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};

// 🚨 EMERGENCY: Optimized image presets to reduce traffic
export const getOptimizedImageUrl = (
  assetId: string,
  preset: 'MICRO' | 'THUMBNAIL' | 'CARD' | 'HERO_MOBILE' | 'HERO_DESKTOP' = 'CARD'
) => {
  if (!assetId) return '';
  
  const presets = {
    MICRO: { width: 24, height: 24, quality: 25 },
    THUMBNAIL: { width: 60, height: 60, quality: 35 },
    CARD: { width: 150, height: 100, quality: 40 },
    HERO_MOBILE: { width: 300, height: 200, quality: 45 },
    HERO_DESKTOP: { width: 400, height: 180, quality: 50 }
  };
  
  return getDirectusImageUrl(assetId, { ...presets[preset], fit: 'cover' });
};