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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it" dir="ltr" className={`${poppins.variable} font-sans`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#1e40af" />
        <meta name="color-scheme" content="light" />
        
        {/* NAVER Webmaster Tools Verification */}
        <meta name="naver-site-verification" content="456897315623611c6ab1dd38be219cded9a1cef6" />
        
        {/* Performance optimizations */}
        <link rel="preconnect" href="https://directus-production-93f0.up.railway.app" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://widget.getyourguide.com" />
        <link rel="preload" href="/images/logo-black.webp" as="image" type="image/webp" />
        <link rel="preload" href="/images/logo-white.webp" as="image" type="image/webp" />
        
        {/* Preload critical CSS */}
        <link rel="preload" href="/fonts/poppins-v20-latin-regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-M4HZ8MZ3');
            `
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