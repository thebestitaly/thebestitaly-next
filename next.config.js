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
  
  // Configurazione cache aggressiva
  experimental: {
    staleTimes: {
      dynamic: 30, // 30 secondi per contenuti dinamici
      static: 180, // 3 minuti per contenuti statici
    },
  },
  
  // Headers per caching
  async headers() {
    return [
      {
        // Cache per assets statici (immagini, CSS, JS)
        source: '/public/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable', // 1 anno
          },
        ],
      },
      {
        // Cache per API di contenuti (non admin)
        source: '/api/((?!admin|auth|widget/generate-static).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=3600, stale-while-revalidate=86400', // 1 ora + 1 giorno stale
          },
        ],
      },
      {
        // Cache per pagine contenuti
        source: '/((?!reserved|admin).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=1800, stale-while-revalidate=3600', // 30 min + 1 ora stale
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