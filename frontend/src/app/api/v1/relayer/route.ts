import { NextRequest, NextResponse } from 'next/server'
const { Defender } = require('@openzeppelin/defender-sdk')
import { ethers } from 'ethers'
import MinimalForwarder from '../../../../../abi/MinimalForwarder.json'

const FORWARDER_ADDRESS = '0x56823B1E1eFcb375774AE955cCE6B1960F083C70'

export async function POST(request: NextRequest) {
  try {
    // リクエストボディの取得
    const body = await request.json()
    const { request: forwardRequest, signature } = body

    const credentials = {
      relayerApiKey: process.env.RELAYER_API_KEY,
      relayerApiSecret: process.env.RELAYER_SECRET_KEY
    }

    const client = new Defender(credentials)
    const provider = client.relaySigner.getProvider()
    const signer = await client.relaySigner.getSigner(provider, {
      speed: 'fast',
      validUntil: Math.floor(Date.now() / 1000) + 3600
    })

    // MinimalForwarderコントラクトのインスタンス化
    const forwarder = new ethers.Contract(
      FORWARDER_ADDRESS,
      MinimalForwarder.abi,
      signer
    )

    // 署名の検証
    const valid = await forwarder.verify(forwardRequest, signature)
    if (!valid) {
      throw new Error('Invalid signature')
    }

    // メタトランザクションの実行
    const tx = await forwarder.execute(forwardRequest, signature)
    console.log(`Meta transaction hash: ${tx.hash}`)

    const receipt = await tx.wait()

    return NextResponse.json({
      success: true,
      receipt: receipt,
      metaTxInfo: {
        relayer: receipt.from,
        forwarder: receipt.to,
        originalSender: forwardRequest.from
      }
    })
  } catch (error) {
    console.error('Gasless transaction failed:', error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}
