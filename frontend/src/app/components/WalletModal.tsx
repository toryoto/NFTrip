'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CuboidIcon as Cube, Activity, Wallet } from 'lucide-react'

export default function Component() {
  const [isOpen, setIsOpen] = useState(false)

  const walletData = {
    wallet_address: '0x1234...5678',
    name: 'Satoshi Nakamoto',
    email: 'satoshi@example.com',
    avatar_image: '/placeholder.svg?height=100&width=100'
  }

  const tokens = [
    { name: 'Sepolia ETH', amount: '1.5' },
  ]

  const nfts = [
    { name: 'CryptoPunk #1234', image: '/placeholder.svg?height=80&width=80' },
    { name: 'Bored Ape #5678', image: '/placeholder.svg?height=80&width=80' },
  ]

  const activities = [
    { type: 'Send', amount: '0.5 ETH', to: '0xabcd...efgh', date: '2023-06-01' },
    { type: 'Receive', amount: '100 USDC', from: '0x9876...5432', date: '2023-05-30' },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
				<button className="flex items-center space-x-3 text-white rounded-lg p-2 transition duration-300 text-left">
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-blue-500 flex items-center justify-center">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-sm font-medium">NFTrip Wallet</div>
            <div className="text-xs text-gray-400">Open your wallet</div>
          </div>
        </button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] xl:max-w-[60vw] h-[90vh] max-h-[800px] p-0 bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-xl shadow-2xl overflow-hidden">
        <div className="flex flex-col h-full">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-2xl sm:text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
              Web3 Wallet
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4 p-6 pt-2 pb-4">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full overflow-hidden bg-blue-700 flex items-center justify-center flex-shrink-0">
                {walletData.avatar_image ? (
                  <img src={walletData.avatar_image} alt={walletData.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-white">{walletData.name.slice(0, 2)}</span>
                )}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">{walletData.name}</h2>
                <p className="text-sm text-blue-300">{walletData.email}</p>
              </div>
            </div>
            <p className="text-xs text-blue-400">{walletData.wallet_address}</p>
          </div>

          <Tabs defaultValue="tokens" className="flex-grow flex flex-col">
            <TabsList className="grid w-full grid-cols-3 bg-gray-800 px-6">
              <TabsTrigger value="tokens" className="text-white data-[state=active]:bg-blue-700">
                <Wallet className="w-4 h-4 mr-2" />
                Tokens
              </TabsTrigger>
              <TabsTrigger value="nfts" className="text-white data-[state=active]:bg-blue-700">
                <Cube className="w-4 h-4 mr-2" />
                NFTs
              </TabsTrigger>
              <TabsTrigger value="activity" className="text-white data-[state=active]:bg-blue-700">
                <Activity className="w-4 h-4 mr-2" />
                Activity
              </TabsTrigger>
            </TabsList>
            
            <div className="flex-grow overflow-hidden">
              <ScrollArea className="h-full p-6">
                <TabsContent value="tokens">
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Tokens</CardTitle>
                      <CardDescription className="text-blue-300">Your current token holdings</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {tokens.map((token, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center mb-4 text-white"
                        >
                          <span>{token.name}</span>
                          <span>{token.amount}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="nfts">
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">NFTs</CardTitle>
                      <CardDescription className="text-blue-300">Your NFT collection</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {nfts.map((nft, index) => (
                          <div
                            key={index}
                            className="text-center"
                          >
                            <img src={nft.image} alt={nft.name} className="w-full h-auto mx-auto mb-2 rounded" />
                            <p className="text-sm text-white">{nft.name}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="activity">
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Activity</CardTitle>
                      <CardDescription className="text-blue-300">Recent transactions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {activities.map((activity, index) => (
                        <div
                          key={index}
                          className="mb-4"
                        >
                          <p className="text-sm text-white">
                            {activity.type} {activity.amount}
                          </p>
                          <p className="text-xs text-blue-400">
                            {activity.type === 'Send' ? 'To: ' : 'From: '}
                            {activity.type === 'Send' ? activity.to : activity.from}
                          </p>
                          <p className="text-xs text-blue-500">{activity.date}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>
              </ScrollArea>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}