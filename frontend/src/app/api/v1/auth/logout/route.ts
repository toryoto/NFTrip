import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
  try {
    await supabase.auth.signOut();

    const response = NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });
    response.cookies.set('auth_token', '', { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0 
    });
    
    return response;
  } catch (error) {
    console.error('Error during logout:', error);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}