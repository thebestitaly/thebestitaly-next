import type { Metadata } from 'next'
import { headers } from 'next/headers'
import directusClient from '@/lib/directus';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it" dir="ltr" className="font-sans">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#1e40af" />
        <meta name="color-scheme" content="light" />
        
        {/* Performance optimizations */}
        <link rel="preconnect" href="https://directus-production-93f0.up.railway.app" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        
        {/* Google Fonts - Optimized loading */}
        <link 
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap" 
          rel="stylesheet"
        />
        
        
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