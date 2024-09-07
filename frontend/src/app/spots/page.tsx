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
import { getLocations } from '@/lib/getLocations'
import { Location } from '@/app/types/location'
import { Loading } from '../components/Loading'

export default function TouristSpots() {
  const [userLocation, setUserLocation] = useState<{ lat: any; lon: any }>({ lat: null, lon: null })
  const [distances, setDistances] = useState<{ [key: number]: number }>({})
  const { user, logout } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()
  const [locations, setLocations] = useState<(Location & { thumbnail: string | null })[]>([])
  const [loading, setLoading] = useState<Boolean>(false);

  useEffect(() => {
    setLoading(true)
    const fetchLocations = async () => {
      const fetchedLocations = await getLocations()
      setLocations(fetchedLocations)
    }
    fetchLocations()
    setLoading(false)
  }, [])

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
      const newDistances: { [key: string]: number } = {}
      locations.forEach(location => {
        const distance = calculateDistance(userLocation.lat, userLocation.lon, location.latitude, location.longitude)
        newDistances[location.id] = distance
      })
      setDistances(newDistances)
    }
  }, [userLocation, locations])

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

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <Header username="John Doe" isLoggingOut={isLoggingOut} onLogout={handleLogout} />
      <main className="flex-1 py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {locations.map((location) => (
            <Card key={location.id} className="bg-gray-800 border-gray-700 overflow-hidden rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 group">
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={`https://chocolate-secret-cat-833.mypinata.cloud/ipfs/${location.thumbnail}`} 
                  alt={location.name}
                  width={640}
                  height={360}
                  className="object-cover w-full h-48 transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-0 group-hover:opacity-70 transition-opacity duration-300" />
              </div>
              <CardContent className="p-4 relative">
                <h3 className="text-xl font-semibold mb-2 text-blue-400 group-hover:text-blue-300 transition-colors duration-300">{location.name}</h3>
                <div className="flex items-center text-gray-400 mb-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{location.address}</span>
                </div>
                <div className="text-sm text-gray-500 mb-2">{location.postal_code}</div>
                {distances[location.id] && (
                  <div className="text-sm text-green-400">
                    距離: {distances[location.id]} km
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