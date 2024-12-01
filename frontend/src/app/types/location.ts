export type Location = {
  id: number
  name: string
  slug: string
  description: string
  address: string
  postal_code: string
  latitude: number
  longitude: number
}

export type LocationImage = {
  id: number
  location_id: number
  image_hash: string
  image_type: 'thumbnail' | 'nft'
  is_primary: boolean
}

// 観光地一覧で必要なLocationとそのサムネイルの型
export interface LocationWithThumbnail extends Location {
  thumbnail: string | null
}

// NFT発行時などユーザとの距離が必要な際の型
export interface LocationWithThumbnailAndDistance extends Location {
  thumbnail: string | null
  distance: number
}
