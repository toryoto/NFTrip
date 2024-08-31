// app/api/v1/auth/me/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface JwtPayload {
  userId: string;
  wallet_address: string;
}

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    const safeUser = {
      id: decoded.userId,
      wallet_address: decoded.wallet_address,
    };

    return NextResponse.json(safeUser);
  } catch (error) {
    console.error('Error verifying token:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
  }
}