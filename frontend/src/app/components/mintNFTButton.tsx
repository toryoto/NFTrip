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
import { motion } from 'framer-motion';
import { Award } from 'lucide-react'
import { getTopNFTHolders } from '@/lib/getNFTRanking';

export default function MintNFTButton({ location }: {location: LocationWithThumbnailAndDistance}) {
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

    toast({
      title: "NFT発行の準備地中です",
      description: `${location.name}限定NFTの準備中です`,
    })

    let NFTMetadataHash: string | undefined; 
  
    try {
      const imageHash = await getNFTImage(location.id);
      console.log('NFT image prepared:', imageHash);

      NFTMetadataHash = await generateAndUploadNFTMetaData(imageHash, location, user);
      if (!NFTMetadataHash) {
        throw new Error('NFT metadata hash is undefined');
      }
      console.log('NFT metadata generated:', NFTMetadataHash);

      toast({
        title: "NFT発行を開始します。この処理には1分程度かかります。",
        description: `あなたの${location.name}への訪問記録をブロックチェーン上に保存します`,
      })

      const { transactionHash, balanceNumber } = await mintNFT(user.auth_type, location.id, `ipfs://${NFTMetadataHash}`);
      console.log('NFT minted successfully! Transaction hash:', transactionHash);

      toast({
        title: "NFTが正常に発行されました！",
        description: `${location.name}に訪問した証明をぜひプロフィールから確認してください！`,
      })

      await updateUserData(balanceNumber);
      await getTopNFTHolders(user.id)

      return transactionHash;
    } catch (error: any) {
      console.error("NFT minting failed:", error);
      // NFTミントエラー時のメッセージをユーザに伝える
      if (error?.info?.error?.message.includes("MetaMask Tx Signature: User denied transaction signature")) {
        toast({
          title: "トランザクションが拒否されました",
          description: "トランザクションを拒否しました。ガス代が十分であることを確認してください。",
          variant: "destructive",
        });
      } else if (error?.message.includes("insufficient funds for intrinsic transaction cost")) {
        toast({
          title: "ガス代不足",
          description: "ガス代が不足しています。ウォレットに十分な資金があることを確認してください。",
          variant: "destructive",
        });
      } else if (error?.message.includes("User has already minted for this location today")) {
        toast({
          title: "デイリーNFT Mint制限",
          description: "NFT Mintは1日1回までです。後日また訪問してクイズに挑戦してください。",
          variant: "destructive",
        });
      } else {
        toast({
          title: "NFTのミントに失敗しました",
          description: error.message || "予期しないエラーが発生しました。もう一度お試しください。",
          variant: "destructive",
        });
      }

      // NFTメタデータが作成され、かつスマートコントラクトでのNFTミントに失敗した場合メタデータを削除する
      if (NFTMetadataHash) {
        await deleteNFTdata(NFTMetadataHash);
      }
    } finally {
      setIsMinting(false)
    }
  };

  return (
    <>
      <Button 
        onClick={(event) => {
          event.preventDefault();
          handleMintNFT();
        }}
        disabled={isMinting}
        className="w-full p-0 h-auto hover:no-underline"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full p-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl shadow-xl hover:bg-gradient-to-r hover:from-orange-500 hover:to-yellow-400"
        >
          <Award className="h-12 w-12 text-white mx-auto mb-2" />
          <h3 className="text-xl font-bold text-white mb-1">おめでとうございます！</h3>
          <p className="text-white text-sm mb-2">ここをクリックしてNFTをゲットしてください！</p>
        </motion.div>
      </Button>
    </>
  );
}