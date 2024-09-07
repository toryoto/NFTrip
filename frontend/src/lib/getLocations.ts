import { supabase } from './supabase'
import { Location, LocationImage,LocationWithThumbnailAndDistance } from '../app/types/location'

export async function getLocations(): Promise<(Location & { thumbnail: string | null })[]> {
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