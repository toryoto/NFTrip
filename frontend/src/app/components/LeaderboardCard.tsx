import { getUserIdFromToken } from "../actions/userProgress";
import { getTopNFTHolders } from "@/lib/getNFTRanking";
import { Card, CardContent } from "@/components/ui/card"
import { Trophy, Medal, Star } from 'lucide-react'
import Image from 'next/image'
import Link from "next/link"

export async function LeaderboardCard() {
  const userId = await getUserIdFromToken()
  const data = await getTopNFTHolders(Number(userId))
  const userRanking = data ? data.ranking : []

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="h-6 w-6 text-yellow-400" />
      case 2: return <Medal className="h-6 w-6 text-gray-400" />
      case 3: return <Medal className="h-6 w-6 text-amber-600" />
      default: return <Star className="h-5 w-5 text-blue-400" />
    }
  }

  return (
    <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700/50 h-full">
      <CardContent className="p-3 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">NFTリーダーボード</h3>
        <div className="space-y-2 sm:space-y-3">
          {userRanking?.map((user, index) => (
            <Link 
              href={`/profile/${user.user_id}`} 
              key={user.user_id}
              className="block transition-transform hover:translate-x-1"
            >
              <div className={`
                p-3 sm:p-4 rounded-lg flex items-center justify-between
                ${user.user_id === Number(userId) 
                  ? "bg-blue-500/10 border border-blue-500/20" 
                  : "bg-gray-700/50"}
              `}>
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-[80px] sm:min-w-[100px]">
                    <span className="font-bold text-base sm:text-lg text-gray-400">#{user.rank}</span>
                    {getRankIcon(user.rank)}
                  </div>
                  <div className="relative w-6 h-6 sm:w-8 sm:h-8">
                    <Image
                      src={user.avatar_url || "/images/no-user-icon.png"}
                      alt={`${user.name}'s avatar`}
                      className="rounded-full object-cover"
                      fill
                      sizes="(max-width: 640px) 24px, 32px"
                    />
                  </div>
                  <span 
                    className="hidden sm:inline-block font-medium text-base text-white"
                    title={user.name}
                  >
                    {user.name}
                  </span>
                  <span 
                    className="sm:hidden font-medium text-sm text-white"
                    title={user.name}
                  >
                  {user.name ? user.name.slice(0, 5) : 'No Name'}{user.name && user.name.length > 5 ? '...' : ''}                  </span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <span className="text-lg sm:text-xl font-bold text-blue-400">{user.total_nfts}</span>
                  <span className="text-xs sm:text-sm text-gray-400">NFTs</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}