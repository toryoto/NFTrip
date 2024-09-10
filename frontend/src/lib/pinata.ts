import { LocationWithThumbnailAndDistance } from '@/app/types/location';
import axios from 'axios';

const PINATA_API_KEY  = process.env.NEXT_PUBLIC_PINATA_API_KEY;
const PINATA_SECRET_API_KEY  = process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY;

if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
  throw new Error('Pinata API keys are not set in the environment variables.');
}

const pinataApiUrl = 'https://api.pinata.cloud';

export async function uploadJsonToPinata(json: Object): Promise<string> {
  const response = await axios.post(`${pinataApiUrl}/pinning/pinJSONToIPFS`, json, {
    headers: {
      pinata_api_key: PINATA_API_KEY,
      pinata_secret_api_key: PINATA_SECRET_API_KEY,
    },
  });

  return `ipfs://${response.data.IpfsHash}`
}

export async function generateAndUploadNFTMetaData(
  imageHash: string,
  location: LocationWithThumbnailAndDistance,
): Promise<string> {
  const date = new Date();
  const metadata = {
    name: `${location.name} Visit`,
    description: `This NFT commemorates your visit to ${location.name} on ${date.toDateString()}.`,
    image: imageHash,
    attributes: [
      {
        trait_type: "Location",
        value: location.name
      },
      {
        trait_type: "Minted Date",
        value: new Date().toISOString()
      }
    ]
  };

  return uploadJsonToPinata(metadata);
}