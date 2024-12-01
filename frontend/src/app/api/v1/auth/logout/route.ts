import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    await supabase.auth.signOut()

    cookies().delete('auth_token')
    const response = NextResponse.json({ message: 'Logged out successfully' }, { status: 200 })
    
    return response
  } catch (error) {
    console.error('Error during logout:', error)
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 })
  }
}