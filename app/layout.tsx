import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { OpenTelemetryProvider } from '@/lib/otel-browser'

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
        <OpenTelemetryProvider>
          {children}
        </OpenTelemetryProvider>
      </body>
    </html>
  )
}
