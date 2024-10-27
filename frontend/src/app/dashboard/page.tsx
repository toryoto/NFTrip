import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, ChevronRight } from 'lucide-react';
import { Footer } from '../components/Footer';
import Header from '../components/Header';
import { NearestNFTSpots } from '../components/NearestNFTSpots';
import { UserProgressCard } from "../components/UserProgressCard";
import { LeaderboardCard } from "../components/LeaderboardCard";

export default function DashboardPage() {
  // Mock data - replace with actual data fetching logic
  const missions = [
    { id: 1, title: "Collect 3 NFTs in Shibuya", progress: 66 },
    { id: 2, title: "Visit 5 historical landmarks", progress: 40 },
    { id: 3, title: "Reach level 10", progress: 50 },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <Header />
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto space-y-8">
          <NearestNFTSpots />

          <section>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <UserProgressCard />

              <div className="bg-gray-800 border-gray-700">
                <LeaderboardCard />
              </div>

              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-blue-400 mb-4">ミッション</h3>
                  <div className="space-y-4">
                    {missions.map((mission) => (
                      <div key={mission.id} className="bg-gray-700 p-4 rounded-lg group hover:bg-gray-600 transition-colors duration-300">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <Target className="mr-2 h-5 w-5 text-blue-400" />
                            <div className="text-sm font-medium text-white">{mission.title}</div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-400 transition-colors duration-300" />
                        </div>
                        <Progress value={mission.progress} className="h-2 bg-gray-600 [&>div[role=progressbar]]:bg-blue-500" />
                        <div className="text-right mt-1">
                          <span className="text-xs text-gray-400">{mission.progress}% Complete</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}