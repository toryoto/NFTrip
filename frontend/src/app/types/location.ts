export type Location = {
  id: number
  name: string
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

export interface LocationWithThumbnailAndDistance extends Location {
  thumbnail: string | null;
  distance: number;
}