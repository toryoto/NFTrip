import { supabase } from './supabase'
import { Location, LocationImage } from '../app/types/location'

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