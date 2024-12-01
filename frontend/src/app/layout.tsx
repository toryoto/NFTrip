import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import dynamic from 'next/dynamic'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

const AuthProviderClient = dynamic(
  () => import('../app/contexts/AuthContext').then((mod) => mod.AuthProvider),
  { ssr: false }
)

export const metadata: Metadata = {
  title: 'NFTrip',
  description:
    '観光地を巡り、現地限定のNFTを収集する新感覚の旅アプリ。思い出をブロックチェーンに刻もう'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icon/nftrip-icon.svg" type="image/svg+xml" />
      </head>
      <body className={inter.className}>
        <AuthProviderClient>{children}</AuthProviderClient>
        <Toaster />
      </body>
    </html>
  )
}
