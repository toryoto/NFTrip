'use client'

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MapPin, Info } from 'lucide-react';
import { useLocations } from '@/hooks/useLocations';
import { Loading } from './Loading';
import { useSmartContractInteractions } from '@/hooks/useSmartContractInteractions';
import { LocationWithThumbnailAndDistance } from '../types/location';
import { getNFTImage } from '@/lib/getLocations';
import { generateAndUploadNFTMetaData } from '@/lib/pinata';
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from '../contexts/AuthContext';
import { updateUserData } from '@/app/actions/totalNFTs';

export const NearestNFTSpots: React.FC = () => {
  const { user } = useAuth();
  const { mintNFT } = useSmartContractInteractions();
  const { nearestLocations, loading } = useLocations();
  const [isMinting, setIsMinting] = useState(false);
  const [isMintingLocation, setIsMintingLocation] = useState<number>();
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleMintNFT = async (location: LocationWithThumbnailAndDistance) => {
    if (!user) {
      console.log('Please authenticate first');
      return;
    }

    setIsMinting(true);
    setIsMintingLocation(location.id)
    setProgress(0);
  
    try {
      setProgress(10);
      const imageHash = await getNFTImage(location.id);
      console.log('NFT image prepared:', imageHash);

      setProgress(40);
      const NFTMetadataHash = await generateAndUploadNFTMetaData(imageHash, location);
      if (!NFTMetadataHash) {
        throw new Error('NFT metadata hash is undefined');
      }
      console.log('NFT metadata generated:', NFTMetadataHash);

      setProgress(70);
      // ミント処理のトランザクションハッシュとミント後のユーザのNFT総数を取得
      const { transactionHash, balanceNumber } = await mintNFT(user.auth_type, location.id, NFTMetadataHash);
      console.log('NFT minted successfully! Transaction hash:', transactionHash);

      setProgress(100);
      toast({
        title: "NFT Minted Successfully!",
        description: `Your new NFT for ${location.name} has been minted with transaction hash: ${transactionHash}`,
      })

      // オンチェーンから取得したユーザのNFT総数Server Actionを使用してDBに更新
      await updateUserData(balanceNumber);

      return transactionHash;
    } catch (error: any) {
      console.error("NFT minting failed:", error);
      toast({
        title: "NFT Minting Failed",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsMinting(false)
      setProgress(0)
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-blue-400">Nearest NFT Spots</h2>
        <Link href="/spots" passHref>
          <Button variant="outline" className="text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-white">
            View All Spots
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {nearestLocations.map((location) => (
          <Card key={location.id} className="bg-gray-800 border-gray-700 overflow-hidden rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 group">
            <div className="relative h-48 overflow-hidden">
              <Image
                src={location.thumbnail || '/images/default-thumbnail.jpg'}
                alt={location.name}
                width={640}
                height={360}
                priority
                className="object-cover w-full h-48 transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-0 group-hover:opacity-70 transition-opacity duration-300" />
            </div>
            <CardContent className="p-4 relative">
              <h3 className="text-xl font-semibold mb-2 text-blue-400 group-hover:text-blue-300 transition-colors duration-300">{location.name}</h3>
              <div className="flex items-center text-green-400 mb-2">
                <MapPin className="h-4 w-4 mr-1 text-green-400" />
                <span>{location.distance.toFixed(2)} km</span>
              </div>
              <Button 
                onClick={() => handleMintNFT(location)}
                disabled={isMinting}
                className="w-full mt-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
              >
                {(isMinting && isMintingLocation == location.id) ? 'Minting...' : 'GET NFT!'}
              </Button>
              {isMinting && (isMintingLocation == location.id) && (
                <div className="mt-2">
                  <Progress value={progress} className="h-2 bg-gray-700 [&>div[role=progressbar]]:bg-blue-500" />
                  <p className="text-sm text-gray-400 mt-1">{progress}% Complete</p>
                </div>
              )}
              <div className="absolute top-4 right-4 bg-blue-500 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Info className="h-4 w-4 text-white" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};