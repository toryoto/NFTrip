"use client"

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Medal, Star } from 'lucide-react';
import Image from 'next/image';


// Mock data for leaderboard
const leaderboardData = [
  { id: 1, name: "Satoshi", nftCount: 42, avatar: "/placeholder.svg?height=40&width=40" },
  { id: 2, name: "Yuki", nftCount: 38, avatar: "/placeholder.svg?height=40&width=40" },
  { id: 3, name: "Haru", nftCount: 35, avatar: "/placeholder.svg?height=40&width=40" },
  { id: 4, name: "Ren", nftCount: 31, avatar: "/placeholder.svg?height=40&width=40" },
  { id: 5, name: "Mei", nftCount: 29, avatar: "/placeholder.svg?height=40&width=40" },
];

// Mock current user data
const currentUser = { id: 42, name: "You", nftCount: 15, rank: 28, avatar: "/placeholder.svg?height=40&width=40" };


export const LeaderboardCard: React.FC = () => {

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="h-6 w-6 text-yellow-400" />;
      case 2: return <Medal className="h-6 w-6 text-gray-400" />;
      case 3: return <Medal className="h-6 w-6 text-amber-600" />;
      default: return <Star className="h-5 w-5 text-blue-400" />;
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700 overflow-hidden">
      <CardContent className="p-6">
        <h3 className="text-2xl font-bold text-blue-400 mb-4">NFTリーダーボード</h3>
        <div className="space-y-4">
          {leaderboardData.map((user, index) => (
            <div
              key={user.id}
              className="bg-gray-700 p-4 rounded-lg flex items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                <span className="font-bold text-lg">{index + 1}</span>
                {getRankIcon(index + 1)}
                <Image src={user.avatar} alt={user.name} width={40} height={40} className="rounded-full" />
                <span className="font-medium">{user.name}</span>
              </div>
              <div
                className="font-bold text-blue-400"
              >
                {user.nftCount} NFTs
              </div>
            </div>
          ))}
        </div>
        {currentUser.rank > 5 && (
          <div
          className="mt-4 bg-gray-700 p-4 rounded-lg flex items-center justify-between border-t-2 border-blue-500"
          >
          <div className="flex items-center space-x-4">
            <span className="font-bold text-lg">{currentUser.rank}</span>
            <Star className="h-5 w-5 text-blue-400" />
            <Image src={currentUser.avatar} alt={currentUser.name} width={40} height={40} className="rounded-full" />
            <span className="font-medium">{currentUser.name}</span>
          </div>
          <div className="font-bold text-blue-400">{currentUser.nftCount} NFTs</div>
        </div>
        )}
      </CardContent>
    </Card>
  );
};