// app/api/v1/auth/me/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { User } from '@/app/types/auth'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as User;

    const safeUser = {
      id: decoded.id,
      wallet_address: decoded.wallet_address,
      auth_type: decoded.auth_type,
      total_nfts: decoded.total_nfts
    };

    return NextResponse.json(safeUser);
  } catch (error) {
    console.error('Error verifying token:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
  }
}