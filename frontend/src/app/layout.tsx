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
  description: "Capture Your Journey: Immortalize Your Travel Memories on the Blockchain",
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