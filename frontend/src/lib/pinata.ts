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

// NFTミント失敗時にあらかじめ作成されたNFTメタデータをPinata上から削除するAPIを叩くメソッド
export async function deleteNFTdata(cid: string) {
  try {
    const response = await axios.delete(`/api/v1/pinata/nft-metadata/${cid}`, {
      data: {cid}
    });
    console.groupCollapsed(response)
    return response.data;
  } catch (error) {
    console.error('Error in deleteNFTdata:', error);
    throw error;
  }
}