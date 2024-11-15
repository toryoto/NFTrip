import { NearestNFTSpots } from '../components/NearestNFTSpots'
import { UserProgressCard } from "../components/UserProgressCard"
import { LeaderboardCard } from "../components/LeaderboardCard"
import Header from '../components/Header'
import { Footer } from '../components/Footer'

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <Header />
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto space-y-8">
          <NearestNFTSpots />

          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <UserProgressCard />
            <LeaderboardCard />
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
