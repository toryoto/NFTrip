'use client'

import React from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MapPin, Calendar, ExternalLink } from 'lucide-react'
import { Footer } from '../../../components/Footer'
import Header from '../../../components/Header'
import { Loading } from '../../../components/Loading'
import { useSmartContractInteractions } from '@/hooks/useSmartContractInteractions'
import { useParams } from 'next/navigation'
import { useUserProfile } from '@/hooks/useUserProfile'
import { useAuth } from '@/app/contexts/AuthContext'
import { useNFTs } from '@/hooks/useNFTs'

export default function NFTGalleryPage() {
  const { user } = useAuth()
  if (!user) {
    throw new Error('User is undefined')
  }
  const { id } = useParams()
  const { userProfile } = useUserProfile(Number(id))
  const { fetchAllNFTs } = useSmartContractInteractions()
  const { nfts, loading } = useNFTs(Number(id), user.auth_type, fetchAllNFTs)

  if (loading) {
    return <Loading />
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <Header />
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto space-y-8">
          <section>
            <h2 className="text-3xl font-bold text-blue-400 mb-6">{`${userProfile?.name} NFTコレクション`}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nfts.map((nft, index) => (
                <Card key={index} className="bg-gray-800 border-gray-700 overflow-hidden rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 group">
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={nft.image}
                      alt={nft.name}
                      fill
                      style={{ objectFit: 'contain' }}
                      className="transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-0 group-hover:opacity-70 transition-opacity duration-300" />
                  </div>
                  <CardContent className="p-4 relative">
                    <h3 className="text-xl font-semibold mb-2 text-blue-400 group-hover:text-blue-300 transition-colors duration-300 whitespace-nowrap overflow-hidden text-ellipsis">{nft.name}</h3>
                    <p className="text-gray-400 mb-4 line-clamp-2 overflow-hidden text-ellipsis min-h-[3rem]">{nft.description}</p>
                    <div className="space-y-2">
                      {nft.attributes.map((attr, attrIndex) => (
                        <div key={attrIndex} className="flex items-center text-sm">
                          {attr.trait_type === 'Location' && <MapPin className="h-4 w-4 mr-2 text-green-400" />}
                          {attr.trait_type === 'Minted Date' && <Calendar className="h-4 w-4 mr-2 text-yellow-400" />}
                          <span className="text-gray-400">{attr.trait_type}:</span>
                          <span className="ml-2 text-white">
                            {attr.trait_type === 'wallet_address'
                              ? `${attr.value.slice(0, 6)}...${attr.value.slice(-4)}` 
                              : attr.value}
                          </span>
                        </div>
                      ))}
                    </div>
                    <Button 
                      className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
                      onClick={() => window.open(`https://testnets.opensea.io/assets/sepolia/0xbe7EeFb23E7B970fcC05F061ba22A0E8dAd94518/${nft.tokenId}`, '_blank')}
                    >
                      Openseaで表示
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}