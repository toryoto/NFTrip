import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
  try {
    await supabase.auth.signOut();
    return NextResponse.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error during logout:', error);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}