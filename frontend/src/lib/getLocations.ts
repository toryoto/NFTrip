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

  // Supabaseから観光地画像を取得
  const { data: images, error: imagesError } = await supabase
    .from('location_images')
    .select('*')
    .eq('image_type', 'thumbnail')
    .eq('is_primary', true)

  if (imagesError) {
    console.error('Error fetching images:', imagesError)
    return locations
  }

  const imageMap = new Map(images.map((img: LocationImage) => [img.location_id, img.image_hash]))

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

  const { data: images, error: imagesError } = await supabase
    .from('location_images')
    .select('*')
    .eq('image_type', 'thumbnail')
    .eq('is_primary', true)
    .in('location_id', locationIds);

  if (imagesError) throw imagesError;

  const imageMap = new Map(images.map((img: LocationImage) => [img.location_id, img.image_hash]));

  const nearestLocations = locations.map((location: Location) => ({
    ...location,
    thumbnail: imageMap.get(location.id) ? `https://chocolate-secret-cat-833.mypinata.cloud/ipfs/${imageMap.get(location.id)}` : null
  }));

  return nearestLocations;
}