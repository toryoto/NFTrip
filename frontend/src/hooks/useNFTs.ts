// hooks/useNFTs.ts

import { useState, useEffect, useCallback } from 'react';
import { NFT } from '@/app/types/nft';
import { toast } from '@/components/ui/use-toast';
import { AuthMethod } from '@/app/types/auth';
import { supabase } from '@/lib/supabase';

type FetchAllNFTs = (method: AuthMethod, wallet_address: string) => Promise<{ tokenId: number, tokenURI: string }[]>

export const useNFTs = (
	userId: string,
	authType: AuthMethod,
	fetchAllNFTs: FetchAllNFTs
) => {
  const [nfts, setNfts] = useState<NFT[]>([])
  const [loading, setLoading] = useState(true)

	const fetchWalletAddress = useCallback(async () => {
    const { data, error } = await supabase
      .from("users")
      .select("wallet_address")
      .eq("id", Number(userId))
      .single()
    if (error) {
      console.error('Error fetching wallet address:', error);
      return null;
    }
    return data.wallet_address;
  }, [userId])

  useEffect(() => {
    const fetchNFTs = async () => {
      if (!authType || !userId) {
        return
      }

      try {
        const wallet_address = await fetchWalletAddress();
        if (!wallet_address) {
          setLoading(false)
          return
        }

        const fetchedNFTs = await fetchAllNFTs(authType, wallet_address);
        if (!fetchedNFTs) {
          setLoading(false)
          return;
        }

        const processedNFTs = await Promise.all(
          fetchedNFTs.map(async (nft: any) => {
            const gateways = [
              `https://${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/ipfs/`,
              'https://ipfs.io/ipfs/',
            ]

            for (const gateway of gateways) {
              try {
                const uri = nft.tokenURI.replace('ipfs://', gateway)
                const response = await fetch(uri)
                if (response.ok) {
                  const data = await response.json()
                  return { ...data, tokenId: nft.tokenId }
                }
              } catch {
                continue
              }
            }
            return { tokenId: nft.tokenId, error: true }
          })
        );

        setNfts(processedNFTs.filter((nft) => !nft.error))
      } catch (error) {
        console.error('Error fetching NFTs:', error)
        toast({
          title: "Error",
          description: "Failed to fetch your NFTs. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchNFTs()
  }, [authType, userId])

  return { nfts, loading }
};
