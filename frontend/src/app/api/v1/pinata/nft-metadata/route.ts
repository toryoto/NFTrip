import { NextResponse } from 'next/server';
import axios from 'axios';

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;
const PINATA_API_URL = 'https://api.pinata.cloud';

export async function POST(request: Request) {
  try {
    const { imageHash, location, user } = await request.json();
    const metadata = {
      name: `${location.name} 訪問記念`,
      description: `${new Date().getMonth() + 1}月${new Date().getDate()}日の${location.name}への訪問を記念するNFTです。`,      external_url: "https://nftrip.vercel.app/",
      image: `https://ipfs.io/ipfs/${imageHash}`,
      attributes: [
        {
          trait_type: "wallet_address",
          value: user.wallet_address
        },
        {
          trait_type: "Location",
          value: location.name
        },
        {
          trait_type: "Minted Date",
          value: new Date().toLocaleString('sv-SE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }).replace(',', '-')
        }
      ]
    };

    const response = await axios.post(`${PINATA_API_URL}/pinning/pinJSONToIPFS`, metadata, {
      headers: {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_API_KEY,
      },
    });

    if (response.data && response.data.IpfsHash) {
      return NextResponse.json({ ipfsHash: response.data.IpfsHash });
    } else {
      throw new Error('Invalid response from Pinata: IpfsHash not found');
    }
  } catch (error) {
    console.error('Error in Pinata NFT Metadata API route:', error);
    return NextResponse.json({ error: 'An error occurred while processing your request' }, { status: 500 });
  }
}