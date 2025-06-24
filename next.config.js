/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ottimizzazioni immagini
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 anno
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'directus-production-93f0.up.railway.app',
      },
      {
        protocol: 'https',
        hostname: 'thebestitaly.eu',
      }
    ],
  },

  // Compressione
  compress: true,
  
  // Headers di performance - SOLO QUELLI STABILI
  async headers() {
    return [
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Ottimizzazioni build - SOLO QUELLE STABILI
  experimental: {
    optimizePackageImports: ['lucide-react', '@heroicons/react'],
    // Rimosso optimizeCss che causava problemi
  },

  // Configurazione webpack per performance
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },

  // Ottimizzazioni build
  swcMinify: true,
  poweredByHeader: false,
  
  // Forza generazione statica per SEO
  output: 'standalone',
  
  // Configurazione per il rewrite dei path
  async rewrites() {
    return [
      {
        source: '/widget/:path*',
        destination: '/api/widget/:path*',
      },
    ];
  },

  // Redirect configuration
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/reserved',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig; 