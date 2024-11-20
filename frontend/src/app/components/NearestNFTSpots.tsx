'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, ChevronRight, Compass } from 'lucide-react'
import { useLocations } from '@/hooks/useLocations'
import { LocationWithThumbnailAndDistance } from '../types/location'
import QuizModal from './QuizModal'

export const NearestNFTSpots: React.FC = () => {
  const { userLocation, fetchNearestLocations } = useLocations()
  const [nearestLocations, setNearestLocations] = useState<LocationWithThumbnailAndDistance[]>([])

  useEffect(() => {
    const fetchLocations = async () => {
      const locations: LocationWithThumbnailAndDistance[] = await fetchNearestLocations()
      if (locations) {
        setNearestLocations(locations)
      }
    }
    fetchLocations()
  }, [userLocation])

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
        <div className="flex items-center space-x-3">
          <MapPin className="w-8 h-8 text-blue-400" />
          <h2 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
            近くのNFTスポット
          </h2>
        </div>
        <Link href="/spots" passHref>
          <Button
            variant="outline"
            className="group bg-blue-500/10 border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white transition-all duration-300 ease-in-out"
          >
            すべての場所を見る
            <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {nearestLocations.map((location) => (
          <div key={location.id} className="group flex flex-col">
            <Card className="bg-gray-800 border-gray-700 overflow-hidden rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 group flex-1">
              <Link href={`/spots/${location.slug}`} className="block">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={location.thumbnail || '/images/default-thumbnail.jpg'}
                    alt={location.name}
                    width={640}
                    height={360}
                    priority
                    className="object-cover w-full h-48 transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-0 group-hover:opacity-70 transition-opacity duration-300" />
                </div>
              </Link>
              <CardContent className="p-4 relative flex-1 flex flex-col justify-between">
                <Link href={`/spots/${location.slug}`} className="block">
                  <h3 className="text-xl md:text-lg lg:text-xl font-semibold mb-2 text-blue-400 group-hover:text-blue-300 transition-colors duration-300 truncate">{location.name}</h3>
                  <div className="flex items-center text-green-400 mb-2">
                    <MapPin className="h-4 w-4 mr-1 text-green-400 flex-shrink-0" />
                    <span className="truncate">{location.distance.toFixed(2)} km</span>
                  </div>
                </Link>
                <div className="flex space-x-2 mt-4">
                  <QuizModal location={location} />
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </section>
  )
}