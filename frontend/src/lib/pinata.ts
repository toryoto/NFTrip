import { LocationWithThumbnailAndDistance } from '@/app/types/location';
import axios from 'axios';

export async function generateAndUploadNFTMetaData(
  imageHash: string,
  location: LocationWithThumbnailAndDistance
): Promise<string> {
  try {
    const response = await axios.post('/api/v1/pinata/nft-metadata', {imageHash, location});
    return response.data.ipfsHash;
  } catch (error) {
    console.error('Error in generateAndUploadNFTMetaData:', error);
    throw error;
  }
}