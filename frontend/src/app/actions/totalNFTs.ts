'use server'

import { revalidatePath } from 'next/cache'
import { supabase } from '@/lib/supabase'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET!

// ブラウザのCookieからユーザーのIDを取得する関数
function getUserIdFromToken(): string | null {
  const token = cookies().get('auth_token')?.value

  if (!token) {
    return null
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string }
    return decoded.id
  } catch (error) {
    console.error('Error decoding token:', error)
    return null
  }
}

// SupabaseからユーザーのNFT総数を取得する関数
export async function getUserData() {
  const userId = getUserIdFromToken()
  if (!userId) {
    throw new Error('Unauthorized')
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('total_nfts')
      .eq('id', userId)
      .single()

    if (error) throw error

    return data
  } catch (error) {
    console.error('Error fetching user data:', error)
    throw error
  }
}

// ユーザーのNFT総数を更新する関数(呼ばれるたびにdashboardのユーザーNFT総数を再検証)
export async function updateUserData(newTotalNFTs: number) {
  const userId = getUserIdFromToken()
  if (!userId) {
    throw new Error('Unauthorized')
  }

  try {
    const { error } = await supabase
      .from('users')
      .update({ total_nfts: newTotalNFTs })
      .eq('id', userId)

    if (error) throw error

		// ダッシュボードのユーザーNFT総数を再検証
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error('Error updating user data:', error)
    throw error
  }
}
