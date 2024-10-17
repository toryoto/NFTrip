'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import Header from '@/app/components/Header'
import { Footer } from '@/app/components/Footer'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Droplet, AlertCircle, HelpCircle, Wallet } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { motion } from "framer-motion"
import { useSepoliaFaucet } from '@/hooks/useSepoliaFaucet'

export default function SepoliaFaucetPage() {
  const { user } = useAuth();
  const [address, setAddress] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const { requestTokens } = useSepoliaFaucet() || {};

  useEffect(() => {
    if (user) setAddress(user.wallet_address)
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    if (!user) {
      console.log('Please authenticate first');
      return;
    }

    e.preventDefault()
    setIsLoading(true)
    setResult(null)

    try {
      if (!requestTokens) {
        throw new Error('requestTokens is undefined');
      }

      const { transactionHash } = await requestTokens(user.auth_type);
      setResult({ 
        success: true, 
        message: `テストトークンの送信に成功しました！ NFTを獲得できます！ トランザクションハッシュ: ${transactionHash}` 
      })
    } catch (error) {
      setResult({ success: false, message: 'トークンの送信に失敗しました。もう一度お試しください。' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white">
      <Header />
      <main className="flex-1 py-12 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto max-w-lg"
        >
          <Card className="bg-gray-800/50 backdrop-blur-md border-gray-700 overflow-hidden rounded-lg shadow-lg shadow-blue-500/20">
            <CardHeader>
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
              >
                <CardTitle className="text-3xl font-bold text-center text-blue-400 flex items-center justify-center">
                  <Droplet className="mr-2 h-6 w-6" />
                  Sepolia Faucet
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="ml-2 h-5 w-5 text-gray-400 hover:text-blue-400 transition-colors duration-200" />
                      </TooltipTrigger>
                      <TooltipContent className="bg-gray-800 border-gray-700 text-white">
                        <p>Sepolia Faucetとは、テストネット上で使用できる無料のテストトークンを取得できるサービスです。</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardTitle>
              </motion.div>
              <CardDescription className="text-center text-gray-400 mt-2">
                NFT取得のためのSepoliaテストトークンを取得できます。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2 text-gray-400">
                  <Label htmlFor="address" className="text-lg">ウォレットアドレス</Label>
                  <div className="relative">
                    <Wallet className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    <Input
                      id="address"
                      placeholder="0x..."
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="bg-gray-700/50 border-gray-600 text-white pl-10 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">テストトークンを受け取るアドレスを入力してください。</p>
                </div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Droplet className="mr-2 h-5 w-5 animate-bounce" />
                        テストトークンを送信中...
                      </>
                    ) : (
                      <>
                        <Droplet className="mr-2 h-5 w-5" />
                        テストトークンを取得
                      </>
                    )}
                  </Button>
                </motion.div>
              </form>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert className={`mt-6 ${result.success ? 'bg-green-700/50' : 'bg-red-700/50'} backdrop-blur-sm`}>
                    <AlertCircle className="h-5 w-5" />
                    <AlertTitle className="text-lg text-white">{result.success ? '成功' : 'エラー'}</AlertTitle>
                    <AlertDescription className="text-white">{result.message}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
              <div className="mt-6 text-sm text-gray-400 bg-gray-800/30 p-4 rounded-lg">
                <p className="font-semibold mb-2">注意事項:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>テストトークンは2日に1回、0.05 ETHまで取得できます。</li>
                  <li>これらのトークンは実際の価値を持ちません。</li>
                  <li>テストネットでの開発やテストにのみ使用してください。</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
      <Footer />
    </div>
  )
}