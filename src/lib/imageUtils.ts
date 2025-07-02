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
  
  // 🔧 HANDLE BOTH ASSET IDs AND FULL URLs
  let actualAssetId = assetId;
  
  // If it's already a full URL (starts with http or contains cdn.thebestitaly.eu)
  if (assetId.startsWith('http') || assetId.includes('cdn.thebestitaly.eu')) {
    // Extract asset ID from various URL formats
    const urlPatterns = [
      /\/assets\/([a-f0-9-]+)/i,  // Standard Directus assets URL
      /assets\/([a-f0-9-]+)/i,    // Without leading slash
    ];
    
    for (const pattern of urlPatterns) {
      const match = assetId.match(pattern);
      if (match && match[1]) {
        actualAssetId = match[1];
        break;
      }
    }
    
    // If we couldn't extract an ID, return the original URL
    if (actualAssetId === assetId) {
      console.warn('Could not extract asset ID from URL:', assetId);
      return assetId; // Return the original URL as-is
    }
  }
  
  // ✅ USE CDN DIRECTLY: Point directly to cdn.thebestitaly.eu
  const baseUrl = `https://cdn.thebestitaly.eu/assets/${actualAssetId}`;
  
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
    THUMBNAIL: { width: 150, height: 120, quality: 55 },
    CARD: { width: 300, height: 200, quality: 60 },
    HERO_MOBILE: { width: 800, height: 500, quality: 75 },
    HERO_DESKTOP: { width: 980, height: 560, quality: 80 }
  };
  
  return getDirectusImageUrl(assetId, { ...presets[preset], fit: 'cover' });
};