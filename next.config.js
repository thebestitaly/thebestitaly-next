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
      },
      {
        protocol: 'https',
        hostname: 'cdn.thebestitaly.eu',
      }
    ],
  },

  // Compressione
  compress: true,
  
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
        // 🎯 COMUNI: Cache lunghissima (quasi mai cambiano)
        source: '/:lang(it|en|fr|de|es)/:region/:province/:municipality',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, stale-while-revalidate=86400', // 1 anno + 1 giorno stale
          },
          {
            key: 'Vary',
            value: 'Accept-Encoding',
          },
        ],
      },
      {
        // 🔄 ARTICOLI: Cache media con ISR
        source: '/:lang(it|en|fr|de|es)/magazine/:path*',
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
        // 🌍 ECCELLENZE: Cache più lungo per POI (cambiano raramente)
        source: '/:lang(it|en|fr|de|es)/poi/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=7200, stale-while-revalidate=14400', // 2 ore + 4 ore stale
          },
          {
            key: 'Vary',
            value: 'Accept-Encoding',
          },
        ],
      },
      {
        // 🏠 HOMEPAGE: Cache breve per contenuto fresco
        source: '/:lang(it|en|fr|de|es)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=900, stale-while-revalidate=1800', // 15 min + 30 min stale
          },
          {
            key: 'Vary',
            value: 'Accept-Encoding',
          },
        ],
      },
      {
        // Cache per pagine contenuti + compressione (fallback)
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

  // 🚀 OTTIMIZZAZIONI STABILI per evitare crash
  experimental: {
    optimizePackageImports: ['lucide-react', '@heroicons/react', '@directus/sdk'],
    staleTimes: {
      dynamic: 30, // 30 secondi per contenuti dinamici
      static: 180, // 3 minuti per contenuti statici
    },
    // 🏗️ Ottimizza il bundle per Railway
    outputFileTracingExcludes: {
      '**': [
        'node_modules/sharp/**',
        'node_modules/@esbuild/**',
        'node_modules/swc/**'
      ]
    }
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
  
  // ⚡ Build performance
  swcMinify: true,
  
  // 🚀 Reduce bundle size
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
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

  // 🚀 WEB APP: Redirect admin requests to admin subdomain
  async redirects() {
    return [
      {
        source: '/:lang/reserved/:path*',
        destination: 'https://admin.thebestitaly.eu/:lang/reserved/:path*',
        permanent: true,
      },
      {
        source: '/:lang/debug/:path*', 
        destination: 'https://admin.thebestitaly.eu/:lang/debug/:path*',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig; 

// Injected content via Sentry wizard below

const { withSentryConfig } = require("@sentry/nextjs");

module.exports = withSentryConfig(
  module.exports,
  {
    // For all available options, see:
    // https://www.npmjs.com/package/@sentry/webpack-plugin#options

    org: "thebestitaly",
    project: "javascript-nextjs",

    // Only print logs for uploading source maps in CI
    silent: !process.env.CI,

    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
    // This can increase your server load as well as your hosting bill.
    // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
    // side errors will fail.
    tunnelRoute: "/monitoring",

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,

    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,
  }
);
