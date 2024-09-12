import { NextResponse } from 'next/server';
import axios from 'axios';

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;
const PINATA_API_URL = 'https://api.pinata.cloud';

export async function POST(request: Request) {
  try {
    const { imageHash, location } = await request.json();
    const metadata = {
      name: `${location.name} Visit`,
      description: `This NFT commemorates your visit to ${location.name} on ${new Date().toDateString()}.`,
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

    const response = await axios.post(`${PINATA_API_URL}/pinning/pinJSONToIPFS`, metadata, {
      headers: {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_API_KEY,
      },
    });

    return NextResponse.json({ ipfsHash: `ipfs://${response.data.ipfsHash}` });
  } catch (error) {
    console.error('Error in Pinata NFT Metadata API route:', error);
    return NextResponse.json({ error: 'An error occurred while processing your request' }, { status: 500 });
  }
}