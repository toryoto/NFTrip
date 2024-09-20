'use client'

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Calendar, ExternalLink } from 'lucide-react';
import { Footer } from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import { Loading } from '../components/Loading';
import { NFT, NFTAttribute } from '../types/nft';
import { useSmartContractInteractions } from '@/hooks/useSmartContractInteractions';
import { useRouter } from 'next/navigation';

export default function NFTGalleryPage() {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { fetchMyNFTs } = useSmartContractInteractions();

  const ipfsToHttp = (ipfsUrl: string) => {
    return `https://chocolate-secret-cat-833.mypinata.cloud/ipfs/${ipfsUrl}`;
  };

  useEffect(() => {
    const fetchNFTs = async () => {
      if (user) {
        try {
          const fetchedNFTs = await fetchMyNFTs(user.auth_type);
          if (!fetchedNFTs) {
            setLoading(false)
            return null;
          }

          const processedNFTs = await Promise.all(fetchedNFTs.map(async (uri) => {
            const response = await fetch(uri.replace('ipfs://', 'https://ipfs.io/ipfs/'));
            const data = await response.json();
            return {
              ...data,
              image: ipfsToHttp(data.image)
            };
          }));
          console.log(processedNFTs)
          setNfts(processedNFTs);
        } catch (error) {
          console.error('Error fetching NFTs:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchNFTs();
  }, [user]);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <Header />
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto space-y-8">
          <section>
            <h2 className="text-3xl font-bold text-blue-400 mb-6">Your NFT Collection</h2>
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
                    <h3 className="text-xl font-semibold mb-2 text-blue-400 group-hover:text-blue-300 transition-colors duration-300">{nft.name}</h3>
                    <p className="text-gray-400 mb-4 line-clamp-2">{nft.description}</p>
                    <div className="space-y-2">
                      {nft.attributes.map((attr, attrIndex) => (
                        <div key={attrIndex} className="flex items-center text-sm">
                          {attr.trait_type === "Location" && <MapPin className="h-4 w-4 mr-2 text-green-400" />}
                          {attr.trait_type === "Minted Date" && <Calendar className="h-4 w-4 mr-2 text-yellow-400" />}
                          <span className="text-gray-400">{attr.trait_type}:</span>
                          <span className="ml-2 text-white">{attr.value}</span>
                        </div>
                      ))}
                    </div>
                    <Button 
                      className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
                      onClick={() => window.open(nft.image, '_blank')}
                    >
                      View Full Image
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
  );
}