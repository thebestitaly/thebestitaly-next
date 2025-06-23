/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ottimizzazioni prestazioni
  compress: true,
  
  // Ottimizzazione immagini
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'directus-production-93f0.up.railway.app',
        port: '',
        pathname: '/assets/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.getyourguide.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'thebestitaly.eu',
        port: '',
        pathname: '/**',
      },
    ],
  },
  
  // Ottimizzazioni build
  experimental: {
    optimizePackageImports: ['lucide-react', '@heroicons/react'],
    optimizeCss: true,
    gzipSize: true,
  },
  
  // Server external packages
  serverExternalPackages: ['sharp'],
  
  // Compressione gzip
  compress: true,
  
  // Performance optimizations
  poweredByHeader: false,
  generateEtags: false,
  
  // Cache ottimizzata
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  
  // Redirects ottimizzati
  async redirects() {
    return []
  },

  // Headers per cache
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000',
          },
        ],
      },
    ]
  },
};

module.exports = nextConfig; 