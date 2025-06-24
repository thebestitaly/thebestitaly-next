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
  
  // FORZA RENDERING STATICO DEI METADATA per PageSpeed
  experimental: {
    optimizePackageImports: ['lucide-react', '@heroicons/react'],
    // optimizeCss: true, // Disabilitato temporaneamente per problemi con critters
    gzipSize: true,
    // Forza rendering statico dei metadata
    staticWorkerRequestDeduping: true,
  },

  // Headers di performance
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
        source: '/_next/image',
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
      // Headers SEO per metadata statici
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'index, follow',
          },
        ],
      },
    ];
  },

  // Ottimizzazioni build
  swcMinify: true,
  poweredByHeader: false,
  
  // Forza generazione statica per SEO
  output: 'standalone',
  
  // Webpack ottimizzazioni
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Ottimizzazioni per metadata statici
    if (!dev && !isServer) {
      config.optimization.splitChunks.cacheGroups.metadata = {
        name: 'metadata',
        test: /[\\/]node_modules[\\/](next[\\/]dist[\\/]shared[\\/]lib[\\/]head\.js|react-dom[\\/]server)/,
        chunks: 'all',
        priority: 20,
      };
    }
    
    return config;
  },

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