import { NextResponse } from 'next/server';
import { PinataSDK } from "pinata-web3";


export async function POST(request: Request) {
  try {
    const { imageHash, location, user } = await request.json();
    const metadata = {
      name: `${location.name} 訪問記念`,
      description: `${new Date().getMonth() + 1}月${new Date().getDate()}日の${location.name}への訪問を記念するNFTです。`,
      external_url: "https://nftrip.vercel.app/",
      image: `https://${process.env.PINATA_GATEWAY}/ipfs/${imageHash}`,
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
          value: new Date().toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            timeZone: 'Asia/Tokyo'
          }).replace(/\//g, '/')
        }
      ]
    };

    const pinata = new PinataSDK({
      pinataJwt: process.env.PINATA_JWT,
      pinataGateway: process.env.PINATA_GATEWAY
    });

    const upload = await pinata.upload.json(
      metadata,
      {
        metadata: {
          name: `${user.id}_${location.name}_metadata.json`
        }
      }
    );

    return NextResponse.json({ ipfsHash: upload.IpfsHash });
  } catch (error) {
    console.error('Error in Pinata NFT Metadata API route:', error);
    return NextResponse.json({ error: 'An error occurred while processing your request' }, { status: 500 });
  }
}