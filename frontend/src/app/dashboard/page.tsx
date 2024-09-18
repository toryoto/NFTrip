'use client'

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Award, Target, ChevronRight } from 'lucide-react';
import { Footer } from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import { NearestNFTSpots } from '../components/NearestNFTSpots';

export default function DashboardPage() {
  const { user } = useAuth();


  // Mock data - replace with actual data fetching logic
  const userLevel = 5;
  const totalNFTs = 23;
  const missions = [
    { id: 1, title: "Collect 3 NFTs in Shibuya", progress: 66 },
    { id: 2, title: "Visit 5 historical landmarks", progress: 40 },
    { id: 3, title: "Reach level 10", progress: 50 },
  ];

  if (!user) return

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <Header />
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto space-y-8">
          <NearestNFTSpots />

          <section>
            <h2 className="text-2xl font-bold text-blue-400 mb-4">Your Progress</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Award className="h-8 w-8 text-yellow-400" />
                      <div className="text-2xl font-bold text-white">Level {userLevel}</div>
                    </div>
                    <div className="text-3xl font-bold text-blue-400">{totalNFTs} NFTs</div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-400">Progress to Level {userLevel + 1}</span>
                      <span className="text-sm text-gray-400">75%</span>
                    </div>
                    <Progress value={75} className="h-2 bg-gray-700 [&>div[role=progressbar]]:bg-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-blue-400 mb-4">Active Missions</h3>
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