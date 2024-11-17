import { NextRequest, NextResponse } from 'next/server';
const { Defender } = require('@openzeppelin/defender-sdk');
import { ethers } from 'ethers';
import SepoliaFaucet from '../../../../../abi/SepoliaFaucet.json';
import MinimalForwarder from '../../../../../abi/MinimalForwarder.json';

const FORWARDER_ADDRESS = '0x56823B1E1eFcb375774AE955cCE6B1960F083C70';

async function decodeRevertReason(trace: string): Promise<string> {
  if (trace.startsWith('0x08c379a0')) {
    // データ部分を切り出し
    const data = '0x' + trace.slice(10);
    const [error] = ethers.utils.defaultAbiCoder.decode(['string'], data);
    return error;
  }
  return 'Unknown error';
}

export async function POST(request: NextRequest) {
  try {
    // リクエストボディの取得
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

    // MinimalForwarderコントラクトのインスタンス化
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

    // メタトランザクションの実行
    const tx = await forwarder.execute(forwardRequest, signature);
    console.log(`Meta transaction hash: ${tx.hash}`);

    const receipt = await tx.wait();

		if (receipt.status === 1) {
			const trace = await provider.call(
				{
					to: forwardRequest.to,
					from: forwardRequest.from,
					data: forwardRequest.data,
					value: forwardRequest.value,
				},
				receipt.blockNumber
			);
			if (trace.startsWith('0x08c379a0')) {
				const errorMessage = await decodeRevertReason(trace);
				throw new Error(errorMessage);
			}
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
      receipt: {
        ...receipt,
        events,
        originalSender: forwardRequest.from
      },
      metaTxInfo: {
        relayer: receipt.from,
        forwarder: receipt.to,
        originalSender: forwardRequest.from
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