'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Footer } from './components/Footer'
import { useAuth } from './contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Loading } from './components/Loading'

export default function Home() {
  const { login, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        if (user) {
          router.push('/dashboard');
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
      } finally {
        setIsLoading(false);
      }
    };
  
    initAuth();
  }, [user, router]);

  const handleLogin = async (method: 'metamask' | 'web3auth') => {
    try {
      setIsLoginLoading(true);
      await login(method);
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.push('/dashboard');
    } catch (error) {
      console.error(`Error during ${method} login:`, error);
    } finally {
      setIsLoginLoading(false);
    }
  }

  return (
    isLoading ? (
      <Loading />
    ) : (
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
            <div className="grid gap-6 md:grid-cols-2 mb-8">
              <Button
                onClick={() => handleLogin('metamask')}
                disabled={isLoginLoading}
                className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-4 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center"
              >
                <Image src="/images/metamask-logo.png" width={32} height={32} alt="Metamask" className="mr-3" />
                <span>{isLoginLoading ? 'Logging in...' : 'Login with Metamask'}</span>
              </Button>
              <Button
                onClick={() => handleLogin('web3auth')}
                disabled={isLoginLoading}
                className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-4 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center"
              >
                <Image src="/images/web3auth-logo.png" width={32} height={32} alt="Web3Auth" className="mr-3" />
                <span>{isLoginLoading ? 'Logging in...' : 'Login with Web3Auth'}</span>
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
  )
}