'use client'

import React, { useEffect, useState } from 'react'
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
import { useUserProfile } from '@/hooks/useUserProfile'
import { Loading } from '@/app/components/Loading'
import { supabase } from '@/lib/supabase'

export default function EditProfilePage() {
  const { user, logout } = useAuth()
  const { userProfile, updateProfile } = useUserProfile(user?.id);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const router = useRouter()
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: '',
    email: '',
    bio: '',
    avatar_url: ''
  });

  // フォーム管理stateにページアクセス時のデータをセットする
  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name,
        email: userProfile.email,
        bio: userProfile.bio,
        avatar_url: userProfile.avatar_url
      });
    }
  }, [userProfile]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setAvatarFile(event.target.files[0]);
    }
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
    const filePath = `${user?.id}_${file.name}`;

    const { error } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (error) {
      console.error('Error uploading avatar:', error);
      return null;
    };

    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);
    
    return data.publicUrl
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      let avatar_url = formData.avatar_url;

      if (avatarFile) {
        const uploadedUrl = await uploadAvatar(avatarFile);
        if (uploadedUrl) {
          avatar_url = uploadedUrl;
        }
      }

      if (userProfile) {
        const updatedProfile: Partial<UserProfile> = {
          ...Object.fromEntries(
            Object.entries(formData).filter(([_, value]) => value !== '')
          ),
          avatar_url: avatar_url || userProfile.avatar_url
        };
        await updateProfile(updatedProfile);
        
        console.log(updatedProfile);
        console.log('Profile updated successfully');
        router.push(`/profile/${user?.wallet_address}`)
      } else {
        console.error('User profile not found');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error(error)
    }
  };

  if (!userProfile) {
    return <Loading />;
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
                      src={formData.avatar_url || "/images/no-user-icon.png"}
                      alt={formData.name || "User avatar"}
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

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name ?? ''}
                    onChange={handleInputChange}
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    placeholder="Enter your name"
                  />
                </div>


                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email ?? ''}
                    onChange={handleInputChange}
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    placeholder="Enter your email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-white">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio ?? ''}
                    onChange={handleInputChange}
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 min-h-[100px]"
                    placeholder="Tell us about yourself"
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