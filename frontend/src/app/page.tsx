'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, User, Award, Target } from 'lucide-react'
import { Footer } from './components/Footer'

export default function Home() {
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const handleMetamaskLogin = () => {
    setIsLoggingIn(true)
    // Metamaskログインのロジックをここに実装
    // 成功後にリダイレクトまたは状態を更新
    setTimeout(() => setIsLoggingIn(false), 2000) // モックの遅延
  }

  const handleWeb3AuthLogin = () => {
    setIsLoggingIn(true)
    // Web3Authログインのロジックをここに実装
    // 成功後にリダイレクトまたは状態を更新
    setTimeout(() => setIsLoggingIn(false), 2000) // モックの遅延
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60">
        <div className="container flex flex-col items-center py-4 md:flex-row md:justify-between">
          <h1 className="text-3xl font-bold text-blue-400 mb-2 md:mb-0">
            Find NFT Spots
          </h1>
          <div className="text-sm font-medium text-gray-300">
            Discover and Collect NFTs
          </div>
        </div>
      </header>
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="grid gap-4 md:grid-cols-2 mb-8">
            <Button
              onClick={handleMetamaskLogin}
              disabled={isLoggingIn}
              className="bg-orange-500 hover:bg-orange-600 text-white py-6 text-lg"
            >
              {isLoggingIn ? 'Logging in...' : 'Login with Metamask'}
              <Image src="/metamask-logo.svg" width={24} height={24} alt="Metamask" className="ml-2" />
            </Button>
            <Button
              onClick={handleWeb3AuthLogin}
              disabled={isLoggingIn}
              className="bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg"
            >
              {isLoggingIn ? 'Logging in...' : 'Login with Web3Auth'}
              <Image src="/web3auth-logo.svg" width={24} height={24} alt="Web3Auth" className="ml-2" />
            </Button>
          </div>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-2xl text-blue-400">Welcome to Find NFT Spots</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300">
              <p className="mb-4">
                Explore the city and discover unique NFT spots around you. Collect digital art, 
                complete missions, and level up your NFT collection experience.
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Find nearby locations with exclusive NFTs</li>
                <li>Complete missions and earn rewards</li>
                <li>Track your progress and level up</li>
                <li>Join a community of NFT enthusiasts</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
//https://v0.dev/chat/LN2LzenWsgO