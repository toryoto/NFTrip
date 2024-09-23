import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, MapPin, Mail } from 'lucide-react'
import { Footer } from '../../components/Footer'
import Header from '../../components/Header'
import { getLocationBySlug } from '@/lib/getLocations'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { LocationDistance } from '@/app/components/LocationDistance'
import { Suspense } from 'react'
import ChatbotModal from '@/app/components/ChatbotModal'

export default async function TouristSpotDetail({ params }: { params: { slug: string } }) {
  const location = await getLocationBySlug(params.slug);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <Header />
      <main className="flex-1 py-8 px-4 max-w-6xl mx-auto w-full">
        <Link href="/spots" className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors duration-300 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          観光地一覧に戻る
        </Link>
        <Card className="overflow-hidden bg-gray-800 border-none">
          <div className="relative h-[400px] overflow-hidden">
            <Image
              src={location.thumbnail || '/placeholder.svg?height=400&width=800'}
              alt={location.name}
              layout="fill"
              objectFit="cover"
              className="transition-transform duration-500 hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6">
              <h1 className="text-4xl md:text-5xl font-bold mb-2 text-white">{location.name}</h1>
              <div className="flex flex-wrap items-center text-gray-300 gap-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-200">
                  <MapPin className="h-4 w-4 mr-1" />
                  {location.address}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-200">
                  <Mail className="h-4 w-4 mr-1" />
                  {location.postal_code}
                </span>
								<Suspense fallback={
									<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-200">
									<MapPin className="h-4 w-4 mr-1" />
									 Loading...
								</span>
								}>
									<LocationDistance lat={location.latitude} lon={location.longitude} />
								</Suspense>
              </div>
            </div>
          </div>
          <CardContent className="p-6 md:p-8">
            <p className="text-gray-300 mb-6 leading-relaxed text-lg">{location.description}</p>
          </CardContent>
          <CardFooter className="p-6 md:p-8 bg-gray-750 flex justify-between items-center">
            <div className="text-sm text-gray-400">
              Last updated: {new Date().toLocaleDateString()}
            </div>
            <ChatbotModal />
            <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white">
              GET NFT!
            </Button>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  )
}