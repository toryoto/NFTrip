import { NextRequest, NextResponse } from 'next/server';
const { Defender } = require('@openzeppelin/defender-sdk');
import { ethers } from 'ethers';
import SepoliaFaucet  from '../../../../../abi/SepoliaFaucet.json';

const FAUCET_ADDRESS = '0x3dA5c533d839e7a03B1D1a674456dBCf52759d88';
const credentials = { relayerApiKey: process.env.RELAYER_API_KEY, relayerApiSecret: process.env.RELAYER_SECRET_KEY };


export async function POST(request: NextRequest) {
  try {
    const client = new Defender(credentials);
		console.log(2222, client)
    const provider = client.relaySigner.getProvider();
    const signer = await client.relaySigner.getSigner(provider, {
      speed: 'fast',
      validUntil: Math.floor(Date.now() / 1000) + 3600
    });


    const faucetContract = new ethers.Contract(
      FAUCET_ADDRESS,
      SepoliaFaucet.abi,
      signer,
    );
    
    const tx = await faucetContract.requestTokens();
    console.log(`Transaction hash: ${tx.hash}`);

    const receipt = await tx.wait();
		console.log(receipt)
    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);

    return NextResponse.json({ success: true, receipt });
  } catch (error) {
    console.error("Gasless transaction failed:", error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}