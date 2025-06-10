/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
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
}

module.exports = nextConfig