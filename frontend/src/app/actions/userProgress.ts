'use server'

import { revalidatePath } from 'next/cache'
import { supabase } from '@/lib/supabase'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET!

// ブラウザのCookieからユーザーのIDを取得する関数
export async function getUserIdFromToken(): Promise<string> {
  const token = cookies().get('auth_token')?.value

  if (!token) {
    throw new Error('Token not found')
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string }
    return decoded.id
  } catch (error) {
    console.error('Error decoding token:', error)
    throw new Error('Invalid token')
  }
}

const XP_PER_NFT = 300;

// レベルとそれに必要なXPの定義
const LEVEL_THRESHOLDS = [
  { level: 1, xp: 0 },
  { level: 2, xp: 900 },    // 3 NFTs
  { level: 3, xp: 2100 },   // 7 NFTs
  { level: 4, xp: 3300 },   // 11 NFTs
  { level: 5, xp: 4800 },   // 16 NFTs
  { level: 6, xp: 6600 },   // 22 NFTs
  { level: 7, xp: 8700 },   // 29 NFTs
  { level: 8, xp: 11100 },  // 37 NFTs
  { level: 9, xp: 13800 },  // 46 NFTs
  { level: 10, xp: 16800 }, // 56 NFTs
];

function calculateXP(totalNFTs: number): number {
  return totalNFTs * XP_PER_NFT;
}

function calculateLevel(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i].xp) {
      return LEVEL_THRESHOLDS[i].level;
    }
  }
  return 1; // デフォルトレベル
}

function calculateProgress(xp: number, level: number): number {
  const currentLevelXP = LEVEL_THRESHOLDS.find(t => t.level === level)!.xp;
  const nextLevelXP = LEVEL_THRESHOLDS.find(t => t.level === level + 1)?.xp || currentLevelXP;
  return Math.min(((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100, 100);
}

// SupabaseからユーザーのNFT総数を取得する関数
export async function getUserData() {
  const userId = await getUserIdFromToken()

  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('user_id,total_nfts, current_level, level_progress')
      .eq('user_id', userId)
      .single()

    if (error) throw error

    const xp = calculateXP(data.total_nfts);
    const newLevel = calculateLevel(xp);
    const progress = parseFloat(calculateProgress(xp, newLevel).toFixed(1));

    return {...data, progress}
  } catch (error) {
    console.error('Error fetching user data:', error)
    throw new Error('Unauthorized')
  }
}

// ユーザーのNFT総数を更新する関数(呼ばれるたびにdashboardのユーザーNFT総数を再検証)
export async function updateUserData(newTotalNFTs: number) {
  const userId = await getUserIdFromToken()
  
  const xp = calculateXP(newTotalNFTs);
  const newLevel = calculateLevel(xp);
  const progress = calculateProgress(xp, newLevel);

  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({ 
        total_nfts: newTotalNFTs,
        current_level: newLevel,
        level_progress: progress
      })
      .eq('user_id', userId)

    if (error) throw error

		// ダッシュボードのユーザーNFT総数を再検証
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error('Error updating user data:', error)
    throw new Error('Unauthorized')
  }
}
