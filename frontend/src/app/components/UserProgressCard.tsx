import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Award } from 'lucide-react';
import { getUserData } from "../actions/userProgress";

export async function UserProgressCard() {
  const userData = await getUserData();

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Award className="h-8 w-8 text-yellow-400" />
            <div className="text-2xl font-bold text-white">レベル {userData.current_level}</div>
          </div>
          <div className="text-3xl font-bold text-blue-400">{userData.total_nfts} NFTs</div>
        </div>
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-400">レベル {userData.current_level + 1} までの進捗</span>
            <span className="text-sm text-gray-400">{userData.progress}%</span>
          </div>
          <Progress value={userData.progress} className="h-2 bg-gray-700 [&>div[role=progressbar]]:bg-blue-500" />
        </div>
      </CardContent>
    </Card>
  );
}