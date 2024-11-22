import { useState, useEffect, useCallback } from 'react';
import { NFT } from '@/app/types/nft';
import { toast } from '@/components/ui/use-toast';
import { AuthMethod } from '@/app/types/auth';
import { supabase } from '@/lib/supabase';

type FetchAllNFTs = (method: AuthMethod, wallet_address: string) => Promise<{ tokenId: number, tokenURI: string }[]>

const gateways = [
	`https://${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/ipfs/`,
	'https://ipfs.io/ipfs/',
]

export const useNFTs = (
	userId: number,
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
      console.error('Error fetching wallet address:', error)
      return null
    }
    return data.wallet_address;
  }, [userId])

  useEffect(() => {
    const fetchNFTs = async () => {
      if (!authType || !userId) {
        return
      }

      try {
        const wallet_address = await fetchWalletAddress()
        if (!wallet_address) {
          setLoading(false)
          return
        }

        const fetchedNFTs = await fetchAllNFTs(authType, wallet_address)
        if (!fetchedNFTs) {
          setLoading(false)
          return;
        }

				const fetchWithFallback = async (url: string): Promise<any> => {
					const errors: string[] = []
					for (const gateway of gateways) {
						const modifiedUrl = url.replace('ipfs://', gateway)
						try {
							const response = await fetch(modifiedUrl)
							if (response.ok) {
								const contentType = response.headers.get('Content-Type') || ''
								if (contentType.includes('application/json')) {
									return await response.json()
								}
								errors.push(`Unexpected Content-Type: ${contentType}`)
							} else {
								errors.push(`Failed with status: ${response.status}`)
							}
						} catch (error: any) {
							errors.push(`Fetch error: ${error.message}`)
						}
					}
					throw new Error(`All gateways failed: ${errors.join('; ')}`)
				};
				
								
				const processedNFTs = await Promise.all(
					fetchedNFTs.map(async (nft: any) => {
						const uri = nft.tokenURI
				
						try {
							const data = await fetchWithFallback(uri)
				
							let imageUrl = data.image;
							if (imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('ipfs://')) {
								imageUrl = await fetchWithFallback(data.image)
							}
				
							return { ...data, tokenId: nft.tokenId, image: imageUrl }
						} catch (error) {
							console.error(`Failed to process NFT with tokenId: ${nft.tokenId}`, error)
							return { tokenId: nft.tokenId, error: true }
						}
					})
				);
				
				processedNFTs.sort((firstNFT, secondNFT) => secondNFT.tokenId - firstNFT.tokenId);
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
