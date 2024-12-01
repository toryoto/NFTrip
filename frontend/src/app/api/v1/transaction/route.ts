import { NextRequest, NextResponse } from 'next/server'
import { ethers } from 'ethers'

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY

interface RawTransaction {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  from: string;
  to: string;
  gasPrice: string;
  functionName: string;
  isInternal?: boolean;
  [key: string]: string | boolean | undefined;
}

interface FormattedTransaction {
  hash: string;
  time: string;
  from: string;
  to: string;
  gasPrice: string;
  action: 'Mint' | 'Send' | 'Receive';
  isInternal: boolean;
}

const formatTransaction = (walletAddress: string, transactions: RawTransaction[]) => {
  return transactions.map(tx => {
    let action: 'Mint' | 'Send' | 'Receive'

    if (tx.functionName?.startsWith('mint')) {
      action = 'Mint'
    } else if (tx.from.toLowerCase() === walletAddress.toLowerCase()) {
      action = 'Send'
    } else {
      action = 'Receive'
    }

    return {
      hash: tx.hash,
      time: new Date(parseInt(tx.timeStamp) * 1000).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }),
      from: tx.from,
      to: tx.to,
      gasPrice: tx.gasPrice ? ethers.utils.formatUnits(tx.gasPrice, 'gwei') : '0',
      action,
      isInternal: !!tx.isInternal,
    }
  })
}

export async function POST(req: NextRequest) {
  try {
    const { address } = await req.json()

    if (!address || typeof address !== 'string') {
      return NextResponse.json(
        { error: 'Invalid address parameter' },
        { status: 400 }
      )
    }

    // Fetch regular transactions
    const txResponse = await fetch(
      `https://api-sepolia.etherscan.io/api?module=account&action=txlist&address=${address}&page=1&offset=100&sort=desc&apikey=${ETHERSCAN_API_KEY}`
    )
    const txData = await txResponse.json()

    // Fetch internal transactions
    const internalTxResponse = await fetch(
      `https://api-sepolia.etherscan.io/api?module=account&action=txlistinternal&address=${address}&page=1&offset=100&sort=desc&apikey=${ETHERSCAN_API_KEY}`
    )
    const internalTxData = await internalTxResponse.json()

    if (txData.status !== '1' || internalTxData.status !== '1') {
      return NextResponse.json(
        { error: 'Failed to fetch transactions' },
        { status: 500 }
      )
    }

    // Merge transactions and sort by timestamp
    const allTransactions: RawTransaction[] = [
      ...txData.result.map((tx: RawTransaction) => ({ ...tx, isInternal: false })),
      ...internalTxData.result.map((tx: RawTransaction) => ({ ...tx, isInternal: true })),
    ].sort((newTx, oldTx) => parseInt(oldTx.timeStamp) - parseInt(newTx.timeStamp))

    // Get latest 10 transactions
    const latestTransactions = allTransactions.slice(0, 10)

    const formattedTransactions: FormattedTransaction[] = formatTransaction(address, latestTransactions)

    return NextResponse.json(formattedTransactions)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
