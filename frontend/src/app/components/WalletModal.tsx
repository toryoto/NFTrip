'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CuboidIcon as Cube, Activity, Wallet } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useUserProfile } from '@/hooks/useUserProfile'
import Image from 'next/image'
import Link from 'next/link'

interface FormattedTransaction {
  hash: string;
  time: string;
  from: string;
  to: string;
  gasPrice: string;
  action: 'Mint' | 'Send' | 'Receive';
}

export default function WalletModal() {
	const { user, getSepoliaBalance } = useAuth()
	const { userProfile } = useUserProfile(user?.id);
  const [isOpen, setIsOpen] = useState(false)
	const [activities, setActivities] = useState([]);
	const [activeTab, setActiveTab] = useState('tokens');
	const [balance, setBalance] = useState('0');

  const walletData = {
    wallet_address: user?.wallet_address,
    name: userProfile?.name,
    email: userProfile?.email,
    avatar_image: userProfile?.avatar_url
  }

	useEffect(() => {
		const fetchBalance = async () => {
			if (user?.auth_type) {
				const balance = await getSepoliaBalance(user.auth_type);
				setBalance(balance)
			} else {
				console.error('Auth type is undefined');
			}
		};
		fetchBalance();

		if (activeTab === 'tokens') {
			fetchBalance();
		}
    if (activeTab === 'activity' && walletData.wallet_address) {
      getActivities(walletData.wallet_address);
    }
	}, [activeTab, walletData.wallet_address]);

  const nfts = [
    { name: 'Pixel Dinasour1 #1234', image: '/images/pixel-dinasour.avif?height=80&width=80' },
    { name: 'Pixel DInasour2 #5678', image: '/images/pixel-dinasour2.jpg?height=80&width=80' },
		{ name: 'Pixel DInasour3 #5678', image: '/images/pixel-dinasour3.avif?height=80&width=80' },
		{ name: 'Pixel DInasour4 #5678', image: '/images/pixel-dinasour4.jpg?height=80&width=80' },
  ]
	
	const getActivities = async (wallet_address: string) => {
		try {
			const response = await fetch('/api/v1/transaction', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ address: wallet_address }),
			});
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			const data = await response.json();
			setActivities(data);
		} catch (error) {
			console.error('Error fetching activities:', error);
		}
	}

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
				<button className="flex items-center space-x-3 text-white rounded-lg transition duration-300 text-left">
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
              NFTrip Wallet
            </DialogTitle>
          </DialogHeader>
					
          
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4 p-6 pt-2 pb-4">
            <div className="flex items-center space-x-4">
							<div className="h-16 w-16 rounded-full overflow-hidden bg-blue-700 flex items-center justify-center flex-shrink-0">
								<img src={walletData.avatar_image || "/images/no-user-icon.png"} alt={"user_avatar"} className="w-full h-full object-cover" />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-white">{walletData.name}</h2>
                <p 
									className="text-sm text-blue-300 hover:text-blue-600"
									onClick={() => navigator.clipboard.writeText(walletData.email || '')}
								>
									{walletData.email}
								</p>
              </div>
            </div>
            <p 
              className="text-xs text-blue-400 cursor-pointer hover:text-blue-600" 
              onClick={() => navigator.clipboard.writeText(walletData.wallet_address || '')}
            >
              {walletData.wallet_address}
            </p>
          </div>

					<Tabs defaultValue="tokens" className="flex-grow flex flex-col" onValueChange={setActiveTab}>
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
											<div className="flex justify-between items-center mb-4 text-white">
												<span>Sepolia ETH</span>
												<span>{balance}</span>
											</div>
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
										{activities.map((activity: FormattedTransaction, index) => (
											<div key={index} className="mb-4">
												<p className="text-sm text-white">
													{activity.action}
												</p>
												<Link 
													href={`https://sepolia.etherscan.io/tx/${activity.hash}`} 
													className="text-xs text-blue-400"
													target="_blank"
  												rel="noopener noreferrer"
												>
													{activity.hash}
												</Link>
												<p className="text-xs text-blue-500">{activity.time}</p>
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