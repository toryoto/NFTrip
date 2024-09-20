import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: Request) {
  const { wallet_address, auth_type } = await req.json();
  try {
    const { data, error } = await supabase
      .from('users')
      .upsert({ wallet_address, auth_type }, { onConflict: 'wallet_address' })
      .select()
      .single();

    if (error) throw error;

    // JWTトークンの生成
    const token = jwt.sign({ id: data.id, wallet_address, auth_type }, JWT_SECRET, { expiresIn: '1d' });

    // cookieをセット
    cookies().set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 86400, // 1日
      path: '/',
    });

    const response = NextResponse.json({ user: data }, { status: 200 });
    return response;
  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}