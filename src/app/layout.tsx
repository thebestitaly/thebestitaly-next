import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'The Best Italy - Discover Amazing Destinations & Experiences',
    template: '%s | The Best Italy'
  },
  description: 'Discover the best destinations, experiences, accommodations and hidden gems in Italy. Your ultimate guide to Italian excellence.',
  keywords: ['Italy', 'travel', 'destinations', 'tourism', 'Italian experiences', 'vacation', 'hotels', 'restaurants'],
  authors: [{ name: 'The Best Italy Team' }],
  creator: 'The Best Italy',
  publisher: 'The Best Italy',
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
    url: 'https://thebestitaly.it',
    siteName: 'The Best Italy',
    title: 'The Best Italy - Discover Amazing Destinations & Experiences',
    description: 'Discover the best destinations, experiences, accommodations and hidden gems in Italy.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Best Italy - Discover Amazing Destinations & Experiences',
    description: 'Discover the best destinations, experiences, accommodations and hidden gems in Italy.',
  },
  alternates: {
    canonical: 'https://thebestitaly.it',
    languages: {
      'it': 'https://thebestitaly.it/it',
      'en': 'https://thebestitaly.it/en',
      'fr': 'https://thebestitaly.it/fr',
      'de': 'https://thebestitaly.it/de',
      'es': 'https://thebestitaly.it/es',
    },
  },
  verification: {
    google: process.env.GOOGLE_VERIFICATION,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#1e40af" />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
} 