'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Loading } from '../components/Loading'
import { MetamaskGuide } from '../components/MetamaskGuide'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ExtendedWindow } from '../types/ethere'

export default function LoginPage() {
  const { login } = useAuth();
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isMetamask, setIsMetamask] = useState(false);
  const [showMetamaskGuide, setShowMetamaskGuide] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMetamask(isMetamaskInstalled())
  }, [])

  const handleLogin = async(method: 'metamask' | 'web3auth') => {
    if (method === 'metamask' && !isMetamask) {
      setShowMetamaskGuide(true);
      return;
    }

    try {
      setIsLoginLoading(true);
      await login(method);
      router.push('/dashboard');
    } catch (error) {
      console.error(`Error during ${method} login:`, error);
    } finally {
      setIsLoginLoading(false);
    }
  }

  const isMetamaskInstalled = () => {
    const ethereum = (window as ExtendedWindow).ethereum; 
    return ethereum !== undefined
  }

  if (isLoginLoading) {
    return <Loading />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4">
      {showMetamaskGuide && <MetamaskGuide onClose={() => setShowMetamaskGuide(false)} />}
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl text-blue-400 text-center">Login to Find NFT Spots</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-gray-300 mb-6">
            Choose your preferred method to login and start your NFT adventure!
          </p>
          <Button
            onClick={() => handleLogin('metamask')}
            disabled={isLoginLoading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 px-6 rounded-lg shadow-md transition duration-300 ease-in-out flex items-center justify-center"
          >
            <Image src="/images/metamask-logo.png" width={32} height={32} alt="Metamask" className="mr-3" />
            <span>Login with Metamask</span>
          </Button>
          <Button
            onClick={() => handleLogin('web3auth')}
            disabled={isLoginLoading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg shadow-md transition duration-300 ease-in-out flex items-center justify-center"
          >
            <Image src="/images/web3auth-logo.png" width={32} height={32} alt="Web3Auth" className="mr-3" />
            <span>Login with Web3Auth</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}