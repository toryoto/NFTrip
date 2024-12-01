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
  [key: string]: string;
}

interface FormattedTransaction {
  hash: string;
  time: string;
  from: string;
  to: string;
  gasPrice: string;
  action: 'Mint' | 'Send' | 'Receive';
}

const formatTransaction = (walletAddress: string, transactions: RawTransaction[]) => {
	return transactions.map(tx => {
    let action: 'Mint' | 'Send' | 'Receive'
    
    if (tx.functionName.startsWith('mint')) {
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
      gasPrice: ethers.utils.formatUnits(tx.gasPrice, 'ether'),
			action
    }
  })
}

export async function POST(req: NextRequest) {
  try {
    const { address } = await req.json()
		console.log(address)

    if (!address || typeof address !== 'string') {
      return NextResponse.json(
        { error: 'Invalid address parameter' },
        { status: 400 }
      )
    }

    const response = await fetch(
      `https://api-sepolia.etherscan.io/api?module=account&action=txlist&address=${address}&page=1&offset=10&sort=desc&apikey=${ETHERSCAN_API_KEY}`
    )

    const data = await response.json()
		const formattedTransactions: FormattedTransaction[] = formatTransaction(address, data.result)

    return NextResponse.json(formattedTransactions)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}