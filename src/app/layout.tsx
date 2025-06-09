import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'The Best Italy',
  description: 'Discover the best destinations, experiences and hidden gems in Italy',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body>
        {children}
      </body>
    </html>
  )
} 