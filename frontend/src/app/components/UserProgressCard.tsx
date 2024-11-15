import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Award } from 'lucide-react'
import Link from "next/link"
import { getUserData } from "../actions/userProgress";

export async function UserProgressCard() {
  const userData = await getUserData()

  return (
    <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700/50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute -inset-1 bg-yellow-400/20 rounded-full blur-sm" />
              <Award className="h-8 w-8 text-yellow-400 relative" />
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-white">レベル {userData.current_level}</div>
            </div>
          </div>
          <Link 
            href={`profile/${userData.user_id}/nfts`} 
            className="px-4 py-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
          >
            <span className="text-sm text-gray-400">Total NFTs</span>
            <div className="text-2xl font-bold text-blue-400">{userData.total_nfts}</div>
          </Link>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">レベル {userData.current_level} → {userData.current_level + 1}</span>
            <span className="text-blue-400 font-medium">{userData.progress}%</span>
          </div>
          <Progress 
            value={userData.progress} 
            className="h-2 bg-gray-700/50 [&>div]:bg-blue-500" 
          />
        </div>
      </CardContent>
    </Card>
  )
}