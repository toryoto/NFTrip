'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from '@/components/ui/input'
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, Save } from 'lucide-react'
import { Footer } from '@/app/components/Footer'
import { useAuth } from '@/app/contexts/AuthContext'
import Header from '@/app/components/Header'
import { useRouter } from 'next/navigation'
import { UserProfile } from '@/app/types/auth'

export default function Component() {
  const { user, logout } = useAuth()
  const router = useRouter()
  
  // Mock user data - replace with actual data fetching logic
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "Alex Johnson",
    bio: "Blockchain enthusiast and NFT collector. Exploring the intersection of art and technology.",
    avatar_url: "",
    email: "alex@example.com",
  })

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error(error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setUserProfile(prev => ({ ...prev, [name]: value }))
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Handle file upload logic here
    console.log("Avatar file selected:", e.target.files?.[0])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission logic here
    console.log("Form submitted with data:", userProfile)
  }

  if (!user) {
    router.push('/');
    return
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <Header wallet_address={user.wallet_address} isLoggingOut={false} onLogout={handleLogout} />
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-2xl">
          <Card className="bg-gray-800 border-gray-700 overflow-hidden rounded-lg shadow-lg shadow-blue-500/20">
            <form onSubmit={handleSubmit}>
              <CardContent className="p-6 space-y-6">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden group">
                    <Image
                      src={"/images/no-user-icon.png" }
                      alt={userProfile.name}
                      fill
                      style={{ objectFit: 'cover' }}
                      className="transition-opacity duration-300 group-hover:opacity-50"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Label htmlFor="avatar-upload" className="cursor-pointer">
                        <Upload className="h-8 w-8 text-white" />
                        <span className="sr-only">Upload new avatar</span>
                      </Label>
                      <Input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-400">Click to change avatar</p>
                </div>

                <div className="space-y-2 text-white">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={userProfile.name}
                    onChange={handleInputChange}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div className="space-y-2 text-white">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={userProfile.email}
                    onChange={handleInputChange}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div className="space-y-2 text-white">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={userProfile.bio}
                    onChange={handleInputChange}
                    className="bg-gray-700 border-gray-600 text-white min-h-[100px]"
                  />
                </div>
              </CardContent>
              <CardFooter className="bg-gray-800 border-t border-gray-700 p-6">
                <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}