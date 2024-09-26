'use client'

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useSmartContractInteractions } from '@/hooks/useSmartContractInteractions';
import { LocationWithThumbnailAndDistance } from '../types/location';
import { getNFTImage } from '@/lib/getLocations';
import { generateAndUploadNFTMetaData } from '@/lib/pinata';
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from '../contexts/AuthContext';
import { updateUserData } from '@/app/actions/userProgress';

interface MintNFTButtonProps {
  location: LocationWithThumbnailAndDistance;
}

export default function MintNFTButton({ location }: MintNFTButtonProps) {
  const { user } = useAuth();
  const { mintNFT } = useSmartContractInteractions();
  const [isMinting, setIsMinting] = useState(false);
  const { toast } = useToast();

  const handleMintNFT = async () => {
    if (!user) {
      console.log('Please authenticate first');
      return;
    }

    setIsMinting(true);
  
    try {
      const imageHash = await getNFTImage(location.id);
      console.log('NFT image prepared:', imageHash);

      const NFTMetadataHash = await generateAndUploadNFTMetaData(imageHash, location);
      if (!NFTMetadataHash) {
        throw new Error('NFT metadata hash is undefined');
      }
      console.log('NFT metadata generated:', NFTMetadataHash);

      const { transactionHash, balanceNumber } = await mintNFT(user.auth_type, location.id, NFTMetadataHash);
      console.log('NFT minted successfully! Transaction hash:', transactionHash);

      toast({
        title: "NFT Minted Successfully!",
        description: `Your new NFT for ${location.name} has been minted with transaction hash: ${transactionHash}`,
      })

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
    }
  };

  return (
    <>
      <Button 
        onClick={handleMintNFT}
        disabled={isMinting}
        className="bg-blue-600 hover:bg-blue-700 text-xs text-white"
      >
        {isMinting ? 'Minting...' : 'GET NFT!'}
      </Button>
    </>
  );
}