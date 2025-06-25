/** @type {import('next').NextConfig} */
const nextConfig = {
  // OTTIMIZZAZIONI IMMAGINI AGGRESSIVE per ridurre Egress
  images: {
    formats: ['image/webp', 'image/avif'],
    // Dimensioni più conservative per ridurre traffico
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 604800, // 7 giorni (fix 32-bit overflow)
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'thebestitaly.eu',
      }
    ],
  },

  // Compressione
  compress: true,
  
  // Configurazione cache aggressiva
  experimental: {
    staleTimes: {
      dynamic: 30, // 30 secondi per contenuti dinamici
      static: 180, // 3 minuti per contenuti statici
    },
  },
  
  // Headers per caching e compressione AGGRESSIVA
  async headers() {
    return [
      {
        // Cache per CSS
        source: '/:path*.css',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, immutable',
          },
        ],
      },
      {
        // Cache per JS
        source: '/:path*.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, immutable',
          },
        ],
      },
      {
        // Cache per immagini
        source: '/:path*.:ext(png|jpg|jpeg|gif|svg|webp|ico)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, immutable',
          },
        ],
      },
      {
        // Cache per font WOFF
        source: '/:path*.woff',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, immutable',
          },
        ],
      },
      {
        // Cache per font WOFF2
        source: '/:path*.woff2',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, immutable',
          },
        ],
      },
      {
        // Cache per API di contenuti (non admin) + compressione
        source: '/api/((?!admin|auth|widget/generate-static).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=7200, stale-while-revalidate=86400', // 2 ore + 1 giorno stale
          },
          {
            key: 'Vary',
            value: 'Accept-Encoding',
          },
        ],
      },
      {
        // Cache per pagine contenuti + compressione
        source: '/((?!reserved|admin).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=3600, stale-while-revalidate=7200', // 1 ora + 2 ore stale
          },
          {
            key: 'Vary',
            value: 'Accept-Encoding',
          },
        ],
      },
      {
        // Cache per assets Directus
        source: '/api/directus/assets/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, immutable', // 7 giorni (fix 32-bit overflow)
          },
          {
            key: 'Vary',
            value: 'Accept-Encoding',
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

  // Configurazione webpack per performance e Redis exclusion
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Exclude Redis and Node.js modules from client bundle
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        querystring: false,
        util: false,
        buffer: false,
        events: false,
        timers: false,
      };

      // Ignore Redis modules on client side
      config.externals = config.externals || [];
      config.externals.push({
        redis: 'redis',
        '@redis/client': '@redis/client',
      });

      // Add module rules to ignore Node.js modules
      config.module.rules.push({
        test: /node_modules[\/\\]redis/,
        use: 'null-loader',
      });
    }
    return config;
  },

  // Ottimizzazioni build
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