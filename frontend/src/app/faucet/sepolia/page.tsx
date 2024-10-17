'use client'

import React, { useState } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import Header from '@/app/components/Header'
import { Footer } from '@/app/components/Footer'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Droplet, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function SepoliaFaucetPage() {
  const { user } = useAuth();
  const [address, setAddress] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setResult(null)

    // Simulate API call to faucet
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      setResult({ success: true, message: 'Tokens sent successfully!' })
    } catch (error) {
      setResult({ success: false, message: 'Failed to send tokens. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <Header />
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-md">
          <Card className="bg-gray-800 border-gray-700 overflow-hidden rounded-lg shadow-lg shadow-blue-500/20">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center text-blue-400">Sepolia Faucet</CardTitle>
              <CardDescription className="text-center text-gray-400">Request Sepolia test tokens</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2 text-gray-400">
                  <Label htmlFor="address">Ethereum Address</Label>
                  <Input
                    id="address"
                    placeholder="0x..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Droplet className="mr-2 h-4 w-4 animate-bounce" />
                      Sending Tokens...
                    </>
                  ) : (
                    <>
                      <Droplet className="mr-2 h-4 w-4" />
                      Request Tokens
                    </>
                  )}
                </Button>
              </form>
              {result && (
                <Alert className={`mt-4 ${result.success ? 'bg-green-900' : 'bg-red-900'}`}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>{result.success ? 'Success' : 'Error'}</AlertTitle>
                  <AlertDescription>{result.message}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}