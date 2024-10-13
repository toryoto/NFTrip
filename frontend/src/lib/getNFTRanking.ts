import { supabase } from '@/lib/supabase'

export async function getTopNFTHolders(userId: number) {
  try {
    const { data: allUsersData, error: allUsersError } = await supabase
      .from('user_profiles')
      .select('user_id, name, avatar_url, total_nfts')
      .order('total_nfts', { ascending: false })
      .order('user_id', { ascending: true })

    if (allUsersError) throw allUsersError

    // ランキングを計算
    let currentRank = 0
    let previousNFTs: number | null = null 
    const rankedUsers = allUsersData.map((user, index) => {
      if (user.total_nfts !== previousNFTs) {
        currentRank = index + 1
        previousNFTs = user.total_nfts
      }
      return { ...user, rank: currentRank }
    })

    const ranking = rankedUsers.slice(0, 5)
    const userRankData = rankedUsers.find(user => user.user_id === userId)

    if (!userRankData) {
      console.warn(`User with ID ${userId} not found in ranked users.`)
    }

    if (userRankData && !ranking.some(user => user.user_id === userId)) {
      ranking.push(userRankData)
    }

    return { ranking }

  } catch (error: any) {
    console.error('Error fetching top NFT holders:', error.message)
    return null
  }
}