/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ottimizzazioni per le performance
  compress: true,
  poweredByHeader: false,
  
  // Ottimizzazione bundle
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Configurazione immagini
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 anno
    remotePatterns: [
      // Railway Production Directus (priorità)
      {
        protocol: 'https',
        hostname: 'directus-production-93f0.up.railway.app',
        pathname: '/assets/**',
      },
      // Server locale (fallback per sviluppo)
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8055',
        pathname: '/assets/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8055',
        pathname: '/assets/**',
      },
    ],
  },
  
  // Headers per performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig 