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
  
  const baseUrl = `${import.meta.env.VITE_DIRECTUS_URL}/assets/${assetId}`;
  
  if (!options) return baseUrl;
  
  const params = new URLSearchParams();
  if (options.width) params.append('width', options.width.toString());
  if (options.height) params.append('height', options.height.toString());
  if (options.fit) params.append('fit', options.fit);
  if (options.quality) params.append('quality', options.quality.toString());
  
  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};