import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SpaceBaddie Avatar Studio',
  description: 'Interactive Avatar Creation with Real-Time Effects',
  openGraph: {
    title: 'SpaceBaddie Avatar Studio',
    description: 'Create epic gaming avatars with interactive controls',
    url: 'https://spacebaddy.com',
    siteName: 'SpaceBaddie',
    images: [
      {
        url: 'https://spacebaddy.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'SpaceBaddie Avatar Studio',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SpaceBaddie Avatar Studio',
    description: 'Create epic gaming avatars with interactive controls',
    images: ['https://spacebaddy.com/og-image.jpg'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-black text-white overflow-x-hidden">
        {children}
      </body>
    </html>
  )
}
