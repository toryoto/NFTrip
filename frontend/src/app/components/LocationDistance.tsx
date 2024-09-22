'use client'

import { MapPin } from 'lucide-react'
import React from 'react'
import { useLocations } from '@/hooks/useLocations'

export const LocationDistance: React.FC<{ lat: number, lon: number }> = ({ lat, lon }) =>{
	const { userLocation } = useLocations()

	const calculateDistance = (lat1: number | null, lon1: number | null, lat2: number, lon2: number): number => {
		if (lat1 === null || lon1 === null) {
			return 0
		}
		console.log(lat1, lon1, lat2, lon2)
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

  return (
		<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-200">
			<MapPin className="h-4 w-4 mr-1 text-green-400" />
			{calculateDistance(userLocation.lat, userLocation.lon, lat, lon)} km
		</span>
  )
}