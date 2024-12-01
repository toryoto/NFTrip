import { supabase } from './supabase'
import {
  Location,
  LocationImage,
  LocationWithThumbnailAndDistance,
  LocationWithThumbnail
} from '../app/types/location'

// Supabaseから全ての観光地情報を取得する関数
export async function getLocations(): Promise<LocationWithThumbnail[]> {
  const { data, error } = await supabase
    .from('locations')
    .select(
      `
      *,
      location_images!inner(
        image_hash
      )
    `
    )
    .eq('location_images.image_type', 'thumbnail')
    .eq('location_images.is_primary', true)
    .limit(100)

  if (error) {
    console.error('Error fetching locations:', error)
    return []
  }

  return data.map((row: any) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    address: row.address,
    postal_code: row.postal_code,
    latitude: row.latitude,
    longitude: row.longitude,
    thumbnail: row.location_images?.[0]?.image_hash
      ? `https://chocolate-secret-cat-833.mypinata.cloud/ipfs/${row.location_images[0].image_hash}`
      : null
  }))
}

// 引数のslugに紐づく観光地情報を取得する関数
export async function getLocationBySlug(slug: string) {
  const { data: location, error } = await supabase
    .from('locations')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Error fetching location:', error)
    return null
  }

  const { data: locationImage, error: locationImagesError } = await supabase
    .from('location_images')
    .select('*')
    .eq('location_id', location.id)
    .eq('image_type', 'thumbnail')
    .eq('is_primary', true)
    .single()

  if (locationImagesError) {
    console.error('Error fetching location images:', locationImagesError)
    return null
  }

  return {
    ...location,
    thumbnail: locationImage.image_hash
      ? `https://chocolate-secret-cat-833.mypinata.cloud/ipfs/${locationImage.image_hash}`
      : null
  }
}

export async function getNearestLocations(
  user_lat: number,
  user_lon: number,
  max_results: number
): Promise<LocationWithThumbnailAndDistance[]> {
  const { data: nearestLocations, error: nearestError } = await supabase.rpc(
    'get_nearest_locations',
    {
      user_lat,
      user_lon,
      max_results
    }
  )

  if (nearestError) {
    console.error('Error fetching nearest locations:', nearestError)
    throw nearestError
  }

  // 取得した場所IDに基づいて画像情報を取得
  const locationIds = nearestLocations.map(
    (location: LocationWithThumbnailAndDistance) => location.id
  )

  const { data: locationImages, error: imagesError } = await supabase
    .from('location_images')
    .select('*')
    .in('location_id', locationIds)
    .eq('image_type', 'thumbnail')
    .eq('is_primary', true)

  if (imagesError) {
    console.error('Error fetching location images:', imagesError)
    throw imagesError
  }

  return nearestLocations.map((location: LocationWithThumbnailAndDistance) => {
    const locationImage = locationImages.find(
      (img) => img.location_id === location.id
    )
    return {
      id: location.id,
      name: location.name,
      slug: location.slug,
      description: location.description,
      address: location.address,
      postal_code: location.postal_code,
      latitude: location.latitude,
      longitude: location.longitude,
      distance: location.distance,
      thumbnail: locationImage?.image_hash
        ? `https://chocolate-secret-cat-833.mypinata.cloud/ipfs/${locationImage.image_hash}`
        : null
    }
  })
}

// 引数の観光地idに紐づくNFT画像を取得する関数
// ここで取得したNFT画像を引数にPinataにNFTメタデータを保存するメソッドを実行する
export async function getNFTImage(locationId: number) {
  const { data: nftImage, error } = await supabase
    .from('location_images')
    .select('*')
    .eq('location_id', locationId)
    .eq('image_type', 'nft')
    .eq('is_primary', true)
    .single()

  if (error) {
    console.error('Error fetching locations:', error)
    throw Error
  }

  return nftImage.image_hash
}
