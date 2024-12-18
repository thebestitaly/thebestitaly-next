/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['127.0.0.1'], // Aggiunge il dominio locale di Directus
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8055',
        pathname: '/assets/**',
      },
    ],
  },
}

module.exports = nextConfig