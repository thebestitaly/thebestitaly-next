import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'

// Configurazione font ottimizzata per performance
const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-poppins',
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
})

// 🎯 META DESCRIPTION GLOBALE per PageSpeed Insights
export const metadata: Metadata = {
  title: {
    template: '%s | TheBestItaly',
    default: 'TheBestItaly - Discover the Best of Italy',
  },
  description: 'Discover the best destinations and excellences of Italy. The complete guide for quality tourism in over 50 languages.',
  keywords: ['Italy', 'travel', 'destinations', 'tourism', 'Italian experiences', 'vacation', 'hotels', 'restaurants', 'excellence'],
  authors: [{ name: 'TheBestItaly' }],
  creator: 'TheBestItaly',
  publisher: 'TheBestItaly',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'it_IT',
    url: 'https://thebestitaly.eu',
    siteName: 'TheBestItaly',
    title: 'TheBestItaly - Discover the Best of Italy',
    description: 'Discover the best destinations and excellences of Italy. The complete guide for quality tourism in over 50 languages.',
    images: [
      {
        url: 'https://thebestitaly.eu/images/hero/hero-img-1.webp',
        width: 1200,
        height: 630,
        alt: 'TheBestItaly - Discover the Best of Italy',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TheBestItaly - Discover the Best of Italy',
    description: 'Discover the best destinations and excellences of Italy. The complete guide for quality tourism in over 50 languages.',
    images: ['https://thebestitaly.eu/images/hero/hero-img-1.webp'],
    creator: '@thebestitaly',
    site: '@thebestitaly',
  },
  other: {
    'format-detection': 'telephone=no',
    'theme-color': '#1e40af',
    'color-scheme': 'light',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it" dir="ltr" className={`${poppins.variable} font-sans`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        {/* 🎯 META DESCRIPTION HARDCODED per PageSpeed Insights */}
        <meta name="description" content="Discover the best destinations and excellences of Italy. The complete guide for quality tourism in over 50 languages." />
        
        {/* 🚫 BLOCCA Cloudflare RUM per evitare errori 404 */}
        <meta name="cf-rum" content="disabled" />
        <meta httpEquiv="Content-Security-Policy" content="connect-src 'self' https://www.googletagmanager.com https://fonts.googleapis.com https://widget.getyourguide.com https://region1.google-analytics.com https://www.google-analytics.com https://analytics.google.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://widget.getyourguide.com https://static.cloudflareinsights.com https://cs.iubenda.com https://www.clarity.ms; object-src 'none';" />
        
        {/* Removed preconnect to Railway to force using our proxy */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://widget.getyourguide.com" />
        
        <link rel="preload" href="/images/logo-black.webp" as="image" type="image/webp" />
        <link rel="preload" href="/images/logo-white.webp" as="image" type="image/webp" />
        <link rel="preload" href="/fonts/poppins-v20-latin-regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#1e40af" />
        <meta name="color-scheme" content="light" />
        
        <meta name="naver-site-verification" content="456897315623611c6ab1dd38be219cded9a1cef6" />
        
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              // Carica GTM in modo differito per ridurre JavaScript inutilizzato
              function loadGTM() {
                if (window.gtmLoaded) return;
                window.gtmLoaded = true;
                
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','GTM-M4HZ8MZ3');
              }
              
              // Carica GTM dopo il primo evento di interazione o dopo 3 secondi
              ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(function(e) {
                window.addEventListener(e, loadGTM, {once: true, passive: true});
              });
              setTimeout(loadGTM, 3000);
            `,
          }}
        />
      </head>
      <body className="antialiased">
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-M4HZ8MZ3"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
            loading="lazy"
          />
        </noscript>
        {children}
      </body>
    </html>
  )
} 