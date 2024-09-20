import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Award } from 'lucide-react';

export function UserProgressCard() {
	const userLevel = 5;

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Award className="h-8 w-8 text-yellow-400" />
            <div className="text-2xl font-bold text-white">レベル {userLevel}</div>
          </div>
          <div className="text-3xl font-bold text-blue-400">{3} NFTs</div>
        </div>
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-400">レベル {userLevel + 1} までの進捗</span>
            <span className="text-sm text-gray-400">{30}%</span>
          </div>
          <Progress value={3} className="h-2 bg-gray-700 [&>div[role=progressbar]]:bg-blue-500" />
        </div>
      </CardContent>
    </Card>
  );
}