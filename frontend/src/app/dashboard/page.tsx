'use client'

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MapPin, Award, Target, ChevronRight, Info } from 'lucide-react';
import { Footer } from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import { getNearestLocations } from '@/lib/getLocations';
import { LocationWithThumbnailAndDistance } from '../types/location';

export default function DashboardPage() {
  // Mock data - replace with actual data fetching logic
  const userLevel = 5;
  const totalNFTs = 23;
  const missions = [
    { id: 1, title: "Collect 3 NFTs in Shibuya", progress: 66 },
    { id: 2, title: "Visit 5 historical landmarks", progress: 40 },
    { id: 3, title: "Reach level 10", progress: 50 },
  ];

  const { user, logout } = useAuth();
  const [userLocation, setUserLocation] = useState<{ lat: number | null; lon: number | null }>({ lat: null, lon: null })
  const [nearestLocations, setNearestLocations] = useState<LocationWithThumbnailAndDistance[]>([])
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });
      },
      (error) => {
        console.error('Geolocation error:', error);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    const fetchNearestLocations = async () => {
      if (userLocation.lat !== null && userLocation.lon !== null) {
        try {
          const fetchedNearestLocations = await getNearestLocations(userLocation.lat, userLocation.lon, 3);
          setNearestLocations(fetchedNearestLocations);
        } catch (error) {
          console.error('Failed to fetch nearest locations:', error);
        }
      }
    };

    fetchNearestLocations();
  }, [userLocation.lat, userLocation.lon]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      router.push('/');
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <Header username={"John Doe"} isLoggingOut={isLoggingOut} onLogout={handleLogout} />
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto space-y-8">
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-blue-400">Nearest NFT Spots</h2>
              <Link href="/spots" passHref>
                <Button variant="outline" className="text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-white">
                  View All Spots
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {nearestLocations.map((location) => (
                  <Card key={location.id} className="bg-gray-800 border-gray-700 overflow-hidden rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 group">
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={location.thumbnail || '/images/default-thumbnail.jpg'}
                        alt={location.name}
                        width={640}
                        height={360}
                        className="object-cover w-full h-48 transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-0 group-hover:opacity-70 transition-opacity duration-300" />
                    </div>
                    <CardContent className="p-4 relative">
                      <h3 className="text-xl font-semibold mb-2 text-blue-400 group-hover:text-blue-300 transition-colors duration-300">{location.name}</h3>
                      <div className="flex items-center text-green-400 mb-2">
                        <MapPin className="h-4 w-4 mr-1 text-green-400" />
                        <span>{location.distance.toFixed(2)} km</span>
                      </div>
                      <div className="absolute top-4 right-4 bg-blue-500 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Info className="h-4 w-4 text-white" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
          </section>

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