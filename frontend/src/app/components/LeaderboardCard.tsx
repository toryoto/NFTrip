"use client"

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Medal, Star } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from "../contexts/AuthContext";
import { getTopNFTHolders } from "@/lib/getNFTRanking";
import Link from "next/link";

type UserRanking = {
  rank: number;
  user_id: number;
  name: string;
  avatar_url: string;
  total_nfts: number;
};

export const LeaderboardCard: React.FC = () => {
	const { user } = useAuth();
	const userId = user?.id
	const [userRanking, setUserRanking] = useState<UserRanking[]>([]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="h-6 w-6 text-yellow-400" />;
      case 2: return <Medal className="h-6 w-6 text-gray-400" />;
      case 3: return <Medal className="h-6 w-6 text-amber-600" />;
      default: return <Star className="h-5 w-5 text-blue-400" />;
    }
  };

	useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const data = await getTopNFTHolders(user.id);
        // 取得したデータをuserRankingにセット
        if (data) {
          setUserRanking(data.ranking);
        }
      }
    };
    fetchData();
  }, [user]);

	return (
		<Card className="bg-gray-800 border-gray-700 overflow-hidden">
			<CardContent className="p-6">
				<h3 className="text-2xl font-bold text-blue-400 mb-4">NFTリーダーボード</h3>
				<div className="space-y-4">
				{userRanking?.map((user, index) => (
					<Link href={`/profile/${user.user_id}`} key={user.user_id} className="block">
						<div
							className={`p-4 rounded-lg flex items-center justify-between ${
								user.user_id ===  userId? "mt-4 bg-gray-700 border-2 border-blue-500" : "bg-gray-700"
							}`}
						>
							<div className="flex items-center space-x-4">
								<span className="font-bold text-lg">{index + 1}</span>
								{getRankIcon(index + 1)}
								<div className="relative w-8 h-8 rounded-full overflow-hidden">
								<Image
									src={ user.avatar_url || "/images/no-user-icon.png"}
									alt="User Avatar"
									style={{ objectFit: 'cover' }}
									className="transition-opacity duration-300 group-hover:opacity-50"
									fill
									sizes="128px"
								/>
							</div>
							<p className="font-medium text-white">{user.name}</p>
							</div>
							<div
								className="font-bold text-blue-400"
							>
								<Link href={`/nfts/${user.user_id}`}>
									{user.total_nfts} NFTs
								</Link>
							</div>
						</div>
					</Link>
				))}
			</div>
			</CardContent>
		</Card>
  );
};