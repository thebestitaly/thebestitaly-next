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
    MICRO: { width: 48, height: 48, quality: 45 },
    THUMBNAIL: { width: 100, height: 80, quality: 55 },
    CARD: { width: 200, height: 150, quality: 60 },
    HERO_MOBILE: { width: 300, height: 200, quality: 60 },
    HERO_DESKTOP: { width: 600, height: 400, quality: 60 }
  };
  
  return getDirectusImageUrl(assetId, { ...presets[preset], fit: 'cover' });
};