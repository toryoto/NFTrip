'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Mail, Edit, Image as ImageIcon } from 'lucide-react'
import { Footer } from '@/app/components/Footer'
import { useAuth } from '@/app/contexts/AuthContext'
import Header from '@/app/components/Header'
import { useRouter } from 'next/navigation'
import { useUserProfile } from '@/hooks/useUserProfile'
import { Loading } from '@/app/components/Loading'

export default function UserProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const { id } = useParams()
  const { userProfile } = useUserProfile(Number(id))

  if (!userProfile) {
    return <Loading />
  }

  // 自分のプロフィールかどうかを判別
  // Editボタンの表示を制御
  const isOwnProfile = (user?.id === Number(id))

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <Header />
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto space-y-8">
          <Card className="bg-gray-800 border-gray-700 overflow-hidden rounded-lg shadow-lg shadow-blue-500/20">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="relative w-32 h-32 rounded-full overflow-hidden">
                  <Image
                    src={userProfile.avatar_url || '/images/no-user-icon.png'}
                    alt={'user_avatar'}
                    fill
                    sizes="200px"
                    style={{ objectFit: 'cover' }}
                    className="transition-transform duration-300 hover:scale-110"
                    priority
                  />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row justify-between items-center mb-2 gap-4">
                    <h1 className="text-3xl font-bold text-blue-400">{userProfile.name || 'No Name'}</h1>
                    <div className="flex gap-2">
                      {isOwnProfile && (
                        <Button 
                          className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
                          onClick={() => router.push(`/profile/${id}/edit`)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Profile
                        </Button>
                      )}
                      <Link href={`/profile/${id}/nfts`} passHref>
                        <Button 
                          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
                        >
                          <ImageIcon className="mr-2 h-4 w-4" />
                          NFTs
                        </Button>
                      </Link>
                    </div>
                  </div>
                  {userProfile.bio && <p className="text-gray-400 mb-4">{userProfile.bio}</p>}
                  <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-4">
                    {userProfile.email && (
                      <div className="flex items-center text-sm">
                        <Mail className="h-4 w-4 mr-2 text-blue-400" />
                        <span className="text-gray-400">{userProfile.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}