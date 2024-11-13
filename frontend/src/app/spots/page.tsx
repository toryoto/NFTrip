import Image from 'next/image'
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Info } from 'lucide-react'
import { Footer } from '../components/Footer'
import Header from '../components/Header'
import { getLocations } from '@/lib/getLocations'

export default async function TouristSpots() {
  const locations = await getLocations()

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <Header />
      <main className="flex-1 py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {locations.map((location) => (
          <Card
            key={location.id}
            className="bg-gray-800 border-gray-700 overflow-hidden rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 group"
          >
            <a
              href={`/spots/${location.slug}`}
              className="block"
            >
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
            </a>
            <CardContent className="p-4 relative">
              <h3 className="text-xl font-semibold mb-2 text-blue-400 group-hover:text-blue-300 transition-colors duration-300">{location.name}</h3>
              <div className="flex items-center text-gray-400 mb-1">
                <MapPin className="h-4 w-4 mr-1" />
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors duration-300"
                >
                  {location.address.length > 30 ? location.address.substring(0, 30) + '...' : location.address}
                </a>
              </div>
              <div className="text-sm text-gray-500 mb-2">{location.postal_code}</div>
            </CardContent>
          </Card>
        ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}