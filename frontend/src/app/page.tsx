import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Footer } from './components/Footer'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60">
        <div className="container flex items-center justify-between py-4">
          <h1 className="text-3xl font-bold text-blue-400">
            Find NFT Spots
          </h1>
          <Link href="/login">
            <Button variant="outline" className="text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-white transition-colors duration-300">
              Login
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>
      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="bg-gray-800 border-gray-700 shadow-lg">
            <CardHeader>
              <CardTitle className="text-3xl text-blue-400 mb-2">Welcome to Find NFT Spots</CardTitle>
              <p className="text-gray-300">Discover and Collect NFTs in the Real World</p>
            </CardHeader>
            <CardContent className="text-gray-300">
              <p className="mb-6 text-lg">
                Explore the city and discover unique NFT spots around you. Collect digital art, 
                complete missions, and level up your NFT collection experience.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <FeatureCard
                  title="Find Exclusive NFTs"
                  description="Discover nearby locations with rare and exclusive NFTs waiting to be collected."
                />
                <FeatureCard
                  title="Complete Missions"
                  description="Engage in exciting missions and earn rewards as you explore the city."
                />
                <FeatureCard
                  title="Track Progress"
                  description="Monitor your achievements and watch your collection grow with each new discovery."
                />
                <FeatureCard
                  title="Join the Community"
                  description="Connect with fellow NFT enthusiasts and share your experiences in our vibrant community."
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-gray-700 p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-blue-300 mb-2">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  )
}