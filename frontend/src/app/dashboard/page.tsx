'use client'

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MapPin, Award, Target, ChevronRight, LogOut } from 'lucide-react';
import { Footer } from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  // Mock data - replace with actual data fetching logic
  const nearbySpots = [
    { id: 1, name: "Tokyo Tower", distance: "0.5 km" },
    { id: 2, name: "Senso-ji Temple", distance: "1.2 km" },
    { id: 3, name: "Meiji Shrine", distance: "2.3 km" },
    { id: 4, name: "Shibuya Crossing", distance: "3.1 km" },
  ];
  const userLevel = 5;
  const totalNFTs = 23;
  const missions = [
    { id: 1, title: "Collect 3 NFTs in Shibuya", progress: 66 },
    { id: 2, title: "Visit 5 historical landmarks", progress: 40 },
    { id: 3, title: "Reach level 10", progress: 50 },
  ];

  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    router.push('/');
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60">
        <div className="container flex flex-col items-center py-4 md:flex-row md:justify-between">
          <h1 className="text-3xl font-bold text-blue-400 mb-2 md:mb-0">
            NFTreasure Hunt
          </h1>
          <Link href="/profile" className="flex items-center space-x-2">
            <div className="text-sm font-medium text-gray-300">John Doe</div>
            <div className="relative w-8 h-8 rounded-full overflow-hidden">
              <Image
                src="/images/no-user-icon.png"
                alt="User Avatar"
                layout="fill"
                objectFit="cover"
              />
            </div>
          </Link>
          <Button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isLoggingOut ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging out...
                </span>
              ) : (
                <>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </>
              )}
            </Button>
        </div>
      </header>
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto grid gap-8 lg:grid-cols-2">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-2xl text-blue-400">Nearby NFT Spots</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {nearbySpots.map((spot) => (
                <Card key={spot.id} className="bg-gray-700 border-gray-600 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-medium text-white">
                      {spot.name}
                    </CardTitle>
                    <MapPin className="h-5 w-5 text-blue-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="text-2xl font-bold text-gray-300">{spot.distance}</div>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                        Get NFT
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-2xl text-blue-400">Your Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Award className="h-6 w-6 text-yellow-400" />
                  <div className="text-lg font-medium text-white">Level {userLevel}</div>
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
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-blue-400">Active Missions</h3>
                {missions.map((mission) => (
                  <div key={mission.id} className="bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <Target className="mr-2 h-5 w-5 text-blue-400" />
                        <div className="text-sm font-medium text-white">{mission.title}</div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
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
      </main>
      <Footer />
    </div>
  );
}