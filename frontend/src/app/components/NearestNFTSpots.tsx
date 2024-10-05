'use client'

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Info } from 'lucide-react';
import { useLocations } from '@/hooks/useLocations';
import { LocationWithThumbnailAndDistance } from '../types/location';
import MintNFTButton from './mintNFTButton';
import QuizModal from './QuizModal';

export const NearestNFTSpots: React.FC = () => {
  const { userLocation, fetchNearestLocations } = useLocations();
  const [nearestLocations, setNearestLocations] = useState<LocationWithThumbnailAndDistance[]>([]);

  useEffect(() =>  {
    const fetchLocations = async () => {
      const locations: LocationWithThumbnailAndDistance[] = await fetchNearestLocations()
      if (locations) {
        setNearestLocations(locations)
      }
    }
    fetchLocations()
  }, [userLocation])

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-blue-400">近くのNFTスポット</h2>
        <Link href="/spots" passHref>
          <Button variant="outline" className="text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-white">
            View All Spots
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {nearestLocations.map((location) => (
        <div key={location.id} className="group">
          <Card className="bg-gray-800 border-gray-700 overflow-hidden rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 group">
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
            <CardContent className="p-4 relative">
              <Link href={`/spots/${location.slug}`} className="block">
                <h3 className="text-xl font-semibold mb-2 text-blue-400 group-hover:text-blue-300 transition-colors duration-300">{location.name}</h3>
                <div className="flex items-center text-green-400 mb-2">
                  <MapPin className="h-4 w-4 mr-1 text-green-400" />
                  <span>{location.distance.toFixed(2)} km</span>
                </div>
              </Link>
              <div className="flex space-x-2 mt-4">
                <QuizModal locationId={location.id} locationName={location.name} />
              </div>
              <div className="absolute top-4 right-4 bg-blue-500 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Info className="h-4 w-4 text-white" />
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
      </div>
    </section>
  );
};