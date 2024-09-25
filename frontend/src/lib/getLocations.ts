import { supabase } from './supabase'
import { Location, LocationImage,LocationWithThumbnailAndDistance, LocationWithThumbnail } from '../app/types/location'

// Supabaseから全ての観光地情報を取得する関数
export async function getLocations(): Promise<LocationWithThumbnail[]> {
  // Supabaseから観光地情報を取得
  const { data: locations, error: locationsError } = await supabase
    .from('locations')
    .select('*')
  
  if (locationsError) {
    console.error('Error fetching locations:', locationsError)
    return []
  }

  const imageMap = await getLocationImagesMap()

  return locations.map((location: Location) => ({
    ...location,
    thumbnail: imageMap.get(location.id) || null
  }))
}

// 引数のslugに紐づく観光地情報を取得する関数
export async function getLocationBySlug(slug: string) {
  const { data: location, error } = await supabase
    .from('locations')
    .select('*')
    .eq('slug', slug)
    .single();

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
    .single();

  if (locationImagesError) {
    console.error('Error fetching location images:', locationImagesError)
    return null
  }

  return {
    ...location,
    thumbnail: locationImage.image_hash ? `https://chocolate-secret-cat-833.mypinata.cloud/ipfs/${locationImage.image_hash}` : null
  }
};

// 引数のユーザの緯度経度に紐づく最寄りの観光地情報を取得する関数
export async function getNearestLocations(user_lat: number, user_lon: number, max_results: number): Promise<LocationWithThumbnailAndDistance[]> {
  const { data: locations, error } = await supabase.rpc('get_nearest_locations', {
    user_lat, user_lon, max_results
  });

  if (error) throw error;

  const locationIds = locations.map((loc: Location) => loc.id);

  const imageMap = await getLocationImagesMap(locationIds);

  return locations.map((location: Location) => ({
    ...location,
    thumbnail: imageMap.get(location.id) || null
  }));
}

// 引数の観光地idに紐づく画像を取得する関数
async function getLocationImagesMap(locationIds?: number[]): Promise<Map<number, string | null>> {
  let query = supabase
    .from('location_images')
    .select('*')
    .eq('image_type', 'thumbnail')
    .eq('is_primary', true)

  if (locationIds) {
    query = query.in('location_id', locationIds)
  }
  
  const { data: images, error } = await query

  if (error) {
    console.error('Error fetching images:', error)
    return new Map()
  }

  return new Map(images.map((img: LocationImage) => [
    img.location_id, 
    img.image_hash ? `https://chocolate-secret-cat-833.mypinata.cloud/ipfs/${img.image_hash}` : null
  ]))
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
    .single();
  
  if (error) {
    console.error('Error fetching locations:', error)
    throw Error
  }

  return nftImage.image_hash;
}