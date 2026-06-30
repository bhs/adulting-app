import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import PlausibleScript from '@/components/PlausibleScript'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Next.js Minimal Vercel',
  description: 'A minimal full-stack Next.js app with TypeScript, Tailwind, and Prisma',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PlausibleScript />
        {children}
      </body>
    </html>
  )
}
