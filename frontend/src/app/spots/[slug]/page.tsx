import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, MapPin, Mail } from 'lucide-react'
import { Footer } from '../../components/Footer'
import Header from '../../components/Header'
import { getLocationBySlug } from '@/lib/getLocations'

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
        <div className="bg-gray-800 rounded-lg overflow-hidden shadow-xl">
          <div className="relative h-96">
            <Image
              src={location.thumbnail || '/images/default-thumbnail.jpg'}
							alt={location.name}
              layout="fill"
              objectFit="cover"
              className="transition-transform duration-300 hover:scale-105"
            />
          </div>
          <div className="p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-blue-400">{location.name}</h1>
            <div className="flex flex-wrap items-center text-gray-400 mb-4">
              <MapPin className="h-5 w-5 mr-2" />
              <span className="mr-4">{location.address}</span>
              <Mail className="h-5 w-5 mr-2" />
              <span>{location.postal_code}</span>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">{location.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 flex items-center justify-center">
                ナビゲーションを開始
              </button>
              <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 flex items-center justify-center">
                GET NFT!
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}