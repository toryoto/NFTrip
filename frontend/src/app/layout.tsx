import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import dynamic from "next/dynamic";
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] });

const AuthProviderClient = dynamic(
  () => import('../app/contexts/AuthContext').then((mod) => mod.AuthProvider),
  { ssr: false }
)

export const metadata: Metadata = {
  title: "Find NFT Spots",
  description: "観光地を巡り、現地限定のNFTを収集する新感覚の旅アプリ。思い出と共にNFTを持ち帰ろう。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProviderClient>
          {children}
        </AuthProviderClient>
        <Toaster />
      </body>
    </html>
  );
}