import { useState, useEffect, useCallback } from 'react'
import { NFT } from '@/app/types/nft'
import { toast } from '@/components/ui/use-toast'
import { AuthMethod } from '@/app/types/auth'
import { supabase } from '@/lib/supabase'

type FetchAllNFTs = (
  method: AuthMethod,
  wallet_address: string
) => Promise<{ tokenId: number; tokenURI: string }[]>

const gateways = [
  `https://${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/ipfs/`,
  'https://ipfs.io/ipfs/'
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
      .from('users')
      .select('wallet_address')
      .eq('id', Number(userId))
      .single()
    if (error) {
      console.error('Error fetching wallet address:', error)
      return null
    }
    return data.wallet_address
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
          return
        }

        const fetchFromGateways = async (url: string): Promise<any> => {
          for (const gateway of gateways) {
            const modifiedUrl = url.replace('ipfs://', gateway)
            try {
              const response = await fetch(modifiedUrl)
              if (response.ok) {
                const contentType = response.headers.get('Content-Type') || ''
                if (contentType.includes('application/json')) {
                  const jsonData = await response.json()
                  return jsonData
                }
              }
            } catch (error: any) {
              console.log(error)
              continue
            }
          }
          throw new Error('All gateways failed')
        }

        // NFTメタデータにhttps:として保存してしまっているので、その対応
        const fetchImageFromGateways = async (url: string): Promise<string> => {
          const pathMatch = url.match(/\/ipfs\/(.+)$/)
          if (!pathMatch) {
            throw new Error('Invalid IPFS URL format')
          }
          const ipfsPath = pathMatch[1]

          for (const gateway of gateways) {
            try {
              const gatewayUrl = `${gateway}${ipfsPath}`
              const response = await fetch(gatewayUrl)

              if (response.ok) {
                const blob = await response.blob()
                return URL.createObjectURL(blob)
              } else {
                console.warn(
                  `Gateway ${gatewayUrl} returned status: ${response.status}`
                )
              }
            } catch (error) {
              console.error(`Error fetching from gateway ${gateway}:`, error)
            }
          }
          throw new Error('Failed to fetch image from all gateways')
        }

        const processedNFTs = await Promise.all(
          fetchedNFTs.map(async (nft: any) => {
            const uri = nft.tokenURI

            try {
              const data = await fetchFromGateways(uri)

              let imageUrl = data.image
              if (imageUrl && typeof imageUrl === 'string') {
                imageUrl = await fetchImageFromGateways(data.image)
              }

              return { ...data, tokenId: nft.tokenId, image: imageUrl }
            } catch (error) {
              console.error(
                `Failed to process NFT with tokenId: ${nft.tokenId}`,
                error
              )
              return { tokenId: nft.tokenId, error: true }
            }
          })
        )

        processedNFTs.sort(
          (firstNFT, secondNFT) => secondNFT.tokenId - firstNFT.tokenId
        )
        setNfts(processedNFTs.filter((nft) => !nft.error))
      } catch (error) {
        console.error('Error fetching NFTs:', error)
        toast({
          title: 'Error',
          description: 'Failed to fetch your NFTs. Please try again later.',
          variant: 'destructive'
        })
      } finally {
        setLoading(false)
      }
    }

    fetchNFTs()
  }, [authType, userId, fetchAllNFTs, fetchWalletAddress])

  return { nfts, loading }
}
