import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { BrowserTelemetryProvider } from '@/lib/otel-browser'

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
        <BrowserTelemetryProvider>{children}</BrowserTelemetryProvider>
      </body>
    </html>
  )
}
