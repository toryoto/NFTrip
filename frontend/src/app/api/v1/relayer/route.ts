// route.ts
import { NextRequest, NextResponse } from 'next/server';
const { Defender } = require('@openzeppelin/defender-sdk');
import { ethers } from 'ethers';
import SepoliaFaucet from '../../../../../abi/SepoliaFaucet.json';
import MinimalForwarder from '../../../../../abi/MinimalForwarder.json';

const FORWARDER_ADDRESS = '0x56823B1E1eFcb375774AE955cCE6B1960F083C70';

// メタトランザクションの実行をハンドルする
async function handleMetaTransaction(forwardRequest: any, signature: string, signer: ethers.Signer) {
  const forwarder = new ethers.Contract(
    FORWARDER_ADDRESS,
    MinimalForwarder.abi,
    signer
  );

  // 署名の検証
  const valid = await forwarder.verify(forwardRequest, signature);
  if (!valid) {
    throw new Error('Invalid signature');
  }

  // トランザクションの送信（waitを使用しない）
  const tx = await forwarder.execute(forwardRequest, signature);
  
  return {
    txHash: tx.hash,
    from: await signer.getAddress(),
    to: FORWARDER_ADDRESS,
    originalSender: forwardRequest.from
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { request: forwardRequest, signature } = body;

    const credentials = {
      relayerApiKey: process.env.RELAYER_API_KEY,
      relayerApiSecret: process.env.RELAYER_SECRET_KEY
    };

    const client = new Defender(credentials);
    const provider = client.relaySigner.getProvider();
    const signer = await client.relaySigner.getSigner(provider, {
      speed: 'fast',
      validUntil: Math.floor(Date.now() / 1000) + 3600
    });

    // メタトランザクションを実行し、トランザクションハッシュを即時に返す
    const txInfo = await handleMetaTransaction(forwardRequest, signature, signer);

    return NextResponse.json({
      success: true,
      message: 'Transaction submitted',
      txInfo: {
        txHash: txInfo.txHash,
        relayer: txInfo.from,
        forwarder: txInfo.to,
        originalSender: txInfo.originalSender
      }
    });

  } catch (error) {
    console.error("Gasless transaction failed:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message }, 
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const txHash = searchParams.get('txHash');
    
    if (!txHash) {
      return NextResponse.json(
        { success: false, error: 'Transaction hash is required' },
        { status: 400 }
      );
    }

    const credentials = {
      relayerApiKey: process.env.RELAYER_API_KEY,
      relayerApiSecret: process.env.RELAYER_SECRET_KEY
    };

    const client = new Defender(credentials);
    const provider = client.relaySigner.getProvider();
    
    const receipt = await provider.getTransactionReceipt(txHash);
    
    if (!receipt) {
      return NextResponse.json({
        success: true,
        status: 'pending',
        txHash
      });
    }

    const faucetInterface = new ethers.utils.Interface(SepoliaFaucet.abi);
    const events = receipt.logs
      .map((log: ethers.providers.Log) => {
        try {
          return faucetInterface.parseLog(log);
        } catch (e) {
          return null;
        }
      })
      .filter((event: ethers.utils.LogDescription | null) => event !== null);

    return NextResponse.json({
      success: true,
      status: 'confirmed',
      receipt: {
        ...receipt,
        events
      }
    });

  } catch (error) {
    console.error("Failed to check transaction status:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}