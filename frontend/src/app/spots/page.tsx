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
import { Loading } from '../components/Loading'
import { useLocations } from '@/hooks/useLocations'

export default function TouristSpots() {
  const { user, logout } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { locations, loading, distances } = useLocations()
  const router = useRouter()

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