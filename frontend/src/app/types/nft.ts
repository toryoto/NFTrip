export type NFTAttribute = {
  trait_type: string
  value: string
}

export type NFT = {
  tokenId: bigint
  name: string
  description: string
  image: string
  attributes: NFTAttribute[]
}
