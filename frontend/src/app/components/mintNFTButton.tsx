'use client'

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useSmartContractInteractions } from '@/hooks/useSmartContractInteractions';
import { LocationWithThumbnailAndDistance } from '../types/location';
import { getNFTImage } from '@/lib/getLocations';
import { generateAndUploadNFTMetaData, deleteNFTdata } from '@/lib/pinata';
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from '../contexts/AuthContext';
import { updateUserData } from '@/app/actions/userProgress';
import { Award } from 'lucide-react'
import { getTopNFTHolders } from '@/lib/getNFTRanking';
import NFTMintingModal from './NFTMintingModal';

export default function MintNFTButton({ location }: { location: LocationWithThumbnailAndDistance }) {
  const { user } = useAuth();
  const { mintNFT } = useSmartContractInteractions();
  const [isMinting, setIsMinting] = useState(false);
  const [mintingStage, setMintingStage] = useState<'preparing' | 'metadata' | 'minting' | 'complete' | 'error' | null>(null);
  const { toast } = useToast();

  const handleMintNFT = async () => {
    if (!user) {
      toast({
        title: "認証が必要です",
        description: "NFTを発行するには、先にウォレット接続が必要です",
        variant: "destructive",
      });
      return;
    }

    setIsMinting(true);
    setMintingStage('preparing');
    await new Promise(resolve => setTimeout(resolve, 5000));

    let NFTMetadataHash: string | undefined;

    try {

      const imageHash = await getNFTImage(location.id);
      console.log('NFT image prepared:', imageHash);

      setMintingStage('metadata');
      NFTMetadataHash = await generateAndUploadNFTMetaData(imageHash, location, user);
      if (!NFTMetadataHash) {
        throw new Error('NFT metadata hash is undefined');
      }
      console.log('NFT metadata generated:', NFTMetadataHash);
      await new Promise(resolve => setTimeout(resolve, 3000));

      setMintingStage('minting');
      const { transactionHash, balanceNumber } = await mintNFT(
        user.auth_type,
        location.id,
        `ipfs://${NFTMetadataHash}`
      );
      console.log('NFT minted successfully! Transaction hash:', transactionHash);

      await updateUserData(balanceNumber);
      await getTopNFTHolders(user.id);
      
      setMintingStage('complete');

      setTimeout(() => {
        setMintingStage(null);
        window.location.href = `profile/${user.id}nfts`;
      }, 5000);

      return transactionHash;

    } catch (error: any) {
      console.error("NFT minting failed:", error);
      setMintingStage('error');

      let errorTitle = "NFTの発行に失敗しました";
      let errorDescription = "予期しないエラーが発生しました。もう一度お試しください。";

      if (error?.info?.error?.message.includes("MetaMask Tx Signature: User denied transaction signature")) {
        errorTitle = "トランザクションが拒否されました";
        errorDescription = "トランザクションを拒否しました。ガス代が十分であることを確認してください。";
      } else if (error?.message.includes("insufficient funds for intrinsic transaction cost")) {
        errorTitle = "ガス代不足";
        errorDescription = "ガス代が不足しています。ウォレットに十分な資金があることを確認してください。";
      } else if (error?.message.includes("User has already minted for this location today")) {
        errorTitle = "デイリーNFT Mint制限";
        errorDescription = "NFT Mintは1日1回までです。後日また訪問してクイズに挑戦してください。";
      }

      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive",
      });

      setTimeout(() => {
        setMintingStage(null);
      }, 3000);

      // NFTメタデータのクリーンアップ
      if (NFTMetadataHash) {
        await deleteNFTdata(NFTMetadataHash);
      }
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <>
      <NFTMintingModal 
        isOpen={!!mintingStage} 
        stage={mintingStage || ''}
        locationName={location.name}
      />

      <Button 
        onClick={(event) => {
          event.preventDefault();
          handleMintNFT();
        }}
        disabled={isMinting}
        className="w-full p-0 h-auto hover:no-underline group"
      >
        <div
          className="w-full p-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl shadow-xl 
                     group-hover:bg-gradient-to-r group-hover:from-orange-500 group-hover:to-yellow-400 
                     transition-all duration-300"
        >
          <Award className="h-12 w-12 text-white mx-auto mb-2 group-hover:scale-110 transition-transform duration-300" />
          <h3 className="text-xl font-bold text-white mb-1">おめでとうございます！</h3>
          <p className="text-white text-sm mb-2">
            {isMinting ? 'NFTを作成中...' : 'ここをクリックしてNFTをゲットしてください！'}
          </p>
          <p className="text-white/80 text-xs">
            このNFTは{location.name}への訪問とクイズクリアの証明として永続的に保存されます
          </p>
        </div>
      </Button>
    </>
  );
}