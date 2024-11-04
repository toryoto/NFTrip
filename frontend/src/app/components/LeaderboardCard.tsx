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
      <CardContent className="p-6">
        <h3 className="text-xl font-bold text-white mb-6">NFTリーダーボード</h3>
        <div className="space-y-3">
          {userRanking?.map((user, index) => (
            <Link 
              href={`/profile/${user.user_id}`} 
              key={user.user_id}
              className="block transition-transform hover:translate-x-1"
            >
              <div className={`
                p-4 rounded-lg flex items-center justify-between
                ${user.user_id === Number(userId) 
                  ? "bg-blue-500/10 border border-blue-500/20" 
                  : "bg-gray-700/50"}
              `}>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 min-w-[100px]">
                    <span className="font-bold text-lg text-gray-400">#{user.rank}</span>
                    {getRankIcon(user.rank)}
                  </div>
                  <div className="relative w-8 h-8">
                    <Image
                      src={user.avatar_url || "/images/no-user-icon.png"}
                      alt={`${user.name}'s avatar`}
                      className="rounded-full object-cover"
                      fill
                      sizes="32px"
                    />
                  </div>
                  <span className="font-medium text-white">{user.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-blue-400">{user.total_nfts}</span>
                  <span className="text-sm text-gray-400">NFTs</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}