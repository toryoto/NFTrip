'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Info } from 'lucide-react'
import { Footer } from '../components/Footer'
import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Header from '../components/Header'

interface TouristSpot {
  id: number;
  name: string;
  prefecture: string;
  city: string;
  image: string;
  lat: number;
  lon: number;
}

const touristSpots: TouristSpot[] = [
  { id: 1, name: "東京タワー", prefecture: "東京都", city: "港区", image: "/placeholder.svg?height=200&width=300", lat: 35.6586, lon: 139.7454 },
  { id: 2, name: "雷門", prefecture: "東京都", city: "台東区", image: "/placeholder.svg?height=200&width=300", lat: 35.7111, lon: 139.7967 },
  { id: 3, name: "東京スカイツリー", prefecture: "東京都", city: "墨田区", image: "/placeholder.svg?height=200&width=300", lat: 35.7100, lon: 139.8107 },
  { id: 4, name: "渋谷スクランブルスクエア", prefecture: "東京都", city: "渋谷区", image: "/placeholder.svg?height=200&width=300", lat: 35.6580, lon: 139.7016 },
]

export default function TouristSpots() {
  const [userLocation, setUserLocation] = useState<{ lat: any; lon: any }>({ lat: null, lon: null })
  const [distances, setDistances] = useState<{ [key: number]: number }>({})
  const { user, logout } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        })
      },
      (error) => console.error(error),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [])

  useEffect(() => {
    if (userLocation.lat !== null && userLocation.lon !== null) {
      const newDistances: { [key: number]: number } = {}
      touristSpots.forEach(spot => {
        const distance = calculateDistance(userLocation.lat, userLocation.lon, spot.lat, spot.lon)
        newDistances[spot.id] = distance
      })
      setDistances(newDistances)
    }
  }, [userLocation])

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    const distance = R * c
    return Number(distance.toFixed(1))
  }

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await logout()
      router.push('/')
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <Header username="John Doe" isLoggingOut={isLoggingOut} onLogout={handleLogout} />
      <main className="flex-1 py-8 px-4">
        {/* <h2 className="text-4xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
          東京の観光スポット
        </h2> */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {touristSpots.map((spot) => (
            <Card key={spot.id} className="bg-gray-800 border-gray-700 overflow-hidden rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 group">
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={spot.image}
                  alt={spot.name}
                  layout="fill"
                  width={640}
                  height={360}
                  className="object-cover w-full h-48 transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-0 group-hover:opacity-70 transition-opacity duration-300" />
              </div>
              <CardContent className="p-4 relative">
                <h3 className="text-xl font-semibold mb-2 text-blue-400 group-hover:text-blue-300 transition-colors duration-300">{spot.name}</h3>
                <div className="flex items-center text-gray-400 mb-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{spot.prefecture}</span>
                </div>
                <div className="text-sm text-gray-500 mb-2">{spot.city}</div>
                {distances[spot.id] && (
                  <div className="text-sm text-green-400">
                    距離: {distances[spot.id]} km
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-blue-500 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Info className="h-4 w-4 text-white" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}