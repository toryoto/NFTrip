import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;


async function isNoTransactionWithin24Hours(address: string) {
  try {
    const response = await fetch(
      `https://api-sepolia.etherscan.io/api?module=account&&action=txlistinternal&address=${address}&page=1&offset=10&sort=desc&apikey=${ETHERSCAN_API_KEY}`
    );

    const data = await response.json();

    if (data.result && data.result.length > 0) {
      const latestTransaction = data.result[0];
      const transactionTime = new Date(latestTransaction.timeStamp * 1000);
      const currentTime = new Date();
      const timeDifference = currentTime.getTime() - transactionTime.getTime();
      const hoursDifference = timeDifference / (1000 * 60 * 60);

      return hoursDifference > 24;
    }
    return true;
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { address } = await req.json();

    if (!address || typeof address !== 'string') {
      return NextResponse.json(
        { error: 'Invalid address parameter' },
        { status: 400 }
      );
    }

    const noRecentTransaction = await isNoTransactionWithin24Hours(address);

    return NextResponse.json({
			noRecentTransaction
    });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}