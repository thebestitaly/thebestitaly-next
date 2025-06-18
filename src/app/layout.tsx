import type { Metadata } from 'next'
import { headers } from 'next/headers'
import directusClient from '@/lib/directus';

export async function generateMetadata(): Promise<Metadata> {
  let pageTitle = 'TheBestItaly - Discover the Best of Italy';
  let pageDescription = 'Scopri le migliori destinazioni e aziende d\'Italia. La guida completa per il turismo di qualità in oltre 50 lingue.';

  try {
    // Fetch the title record with ID = 1
    const record = await directusClient.get('/items/titles/1', {
      params: {
        fields: ['translations.title', 'translations.seo_title', 'translations.seo_summary'],
        deep: {
          translations: {
            _filter: {
              languages_code: { _eq: 'it' }
            }
          }
        }
      }
    });

    const titleData = record?.data?.data;
    const translation = titleData?.translations?.[0];
    if (translation) {
      pageTitle = translation.seo_title || translation.title || pageTitle;
      pageDescription = translation.seo_summary || pageDescription;
    }
  } catch (error) {
    console.warn('Could not fetch titles from database, using defaults:', error);
    // Utilizziamo i valori di default già impostati
  }

  return {
    title: {
      default: pageTitle,
      template: '%s | TheBestItaly'
    },
    description: pageDescription,
    keywords: ['Italy', 'travel', 'destinations', 'tourism', 'Italian experiences', 'vacation', 'hotels', 'restaurants'],
    openGraph: {
      type: 'website',
      locale: 'it_IT',
      url: 'https://thebestitaly.eu',
      siteName: 'TheBestItaly',
      title: pageTitle,
      description: pageDescription,
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
    },
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
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it" dir="ltr" className="font-sans">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#1e40af" />
        
        {/* Performance optimizations */}
        <link rel="preconnect" href="https://directus-production-93f0.up.railway.app" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        
        {/* Google Fonts - Optimized loading */}
        <link 
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap" 
          rel="preload"
          as="style"
        />
        <link 
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap" 
          rel="stylesheet"
        />
        
        {/* Google Tag Manager - Lazy Load */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Initialize dataLayer
              window.dataLayer = window.dataLayer || [];
              
              // Lazy load GTM after user interaction or page load
              function loadGTM() {
                if (window.gtmLoaded) return;
                window.gtmLoaded = true;
                
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','GTM-M4HZ8MZ3');
              }
              
              // Load GTM on first user interaction
              ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(function(event) {
                document.addEventListener(event, loadGTM, {once: true, passive: true});
              });
              
              // Fallback: load after 3 seconds if no interaction
              setTimeout(loadGTM, 3000);
            `,
          }}
        />
        {/* End Google Tag Manager */}
      </head>
      <body className="antialiased">
        {/* Google Tag Manager (noscript) - Lazy Load */}
        <noscript>
          <iframe 
            src="https://www.googletagmanager.com/ns.html?id=GTM-M4HZ8MZ3"
            height="0" 
            width="0" 
            style={{display: 'none', visibility: 'hidden'}}
            loading="lazy"
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        
        {children}
      </body>
    </html>
  )
} 