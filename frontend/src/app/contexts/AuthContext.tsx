'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { User, AuthMethod, AuthContextType } from '../types/auth'
import { Loading } from '../components/Loading'
import { useRouter } from 'next/navigation'
import { initWeb3Auth, getWeb3AuthAccountInfo, connectWeb3Auth } from '@/lib/web3auth'
import { Web3Auth } from "@web3auth/modal"
import { supabase } from '@/lib/supabase'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null)
  const router = useRouter()

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true)

      try {
        const web3authInstance = await initWeb3Auth()
        setWeb3auth(web3authInstance)

        await checkAuth()
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  const getProvider = async (method: AuthMethod): Promise<ethers.providers.Web3Provider> => {
    if (method === 'metamask') {
      const { ethereum } = window as any;
      if (!ethereum) {
        throw new Error('MetaMask not detected');
      }
      const provider = new ethers.providers.Web3Provider(ethereum)
      await ethereum.request?.({ method: 'eth_requestAccounts' })
      return provider
    } else {
      if (!web3auth) {
        throw new Error('Web3Auth not initialized')
      }
      const web3authProvider = await web3auth.connect();
      return new ethers.providers.Web3Provider(web3authProvider as any)
    }
  };

  const getAddress = async (provider: ethers.providers.Web3Provider): Promise<string> => {
    const signer = await provider.getSigner()
    return await signer.getAddress()
  };

  const getSepoliaBalance = async (method: AuthMethod) => {
    if (method === 'metamask') {
      const provider = await getProvider(method)
      const accounts = await provider.send('eth_requestAccounts', [])
      const address = accounts[0]

      // 残高を取得
      const balance = await provider.getBalance(address)
      return ethers.utils.formatEther(balance)
    } else {
      if (!web3auth) {
        throw new Error('Web3Auth not initialized')
      }
      const ethersProvider = await connectWeb3Auth(web3auth)
      const signer = await ethersProvider.getSigner()
      const address = await signer.getAddress()
      const balance = await ethersProvider.getBalance(address)
      return ethers.utils.formatEther(balance)
    }
  }

  const login = async (method: AuthMethod) => {
    try {
      const provider = await getProvider(method)
      const address = await getAddress(provider)

      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ wallet_address: address, auth_type: method }),
        credentials: 'include',
      });
  
      if (!response.ok) {
        throw new Error('Login failed')
      }

      const { user: user, isNewUser } = await response.json()

      setUser(user)
      if (isNewUser && method === 'web3auth') await setWeb3AuthUserProfile(user)

      return user
    } catch (error) {
      await logout()
      console.error(`Error during ${method} login:`, error)
      throw error
    }
  };

  const setWeb3AuthUserProfile = async (user: User) => {
    try {
      const userInfo = await web3auth?.getUserInfo()
      if (userInfo) {
        console.log(userInfo)

        const avatar_url = await uploadAvatarFromUrl(userInfo.profileImage || '/images/no-user-icon.png', user.id)

        const { error } = await supabase
          .from('user_profiles')
          .update({ name: userInfo.name, email: userInfo.email, avatar_url: avatar_url })
          .eq('user_id', user.id)
          .single()
        
        if (error) throw error
      }
		} catch (error) {
      await logout()
			console.log(`Failed to update user profile${error}`)
		}
  }

  const uploadAvatarFromUrl = async (url: string, userId: number): Promise<string | null> => {
    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch the image')
      const blob = await response.blob()
  
      const fileExtension = blob.type.split('/')[1];
      const fileName = `${String(userId)}_avatar.${fileExtension}`
  
      // blobをFileオブジェクトに変換
      const file = new File([blob], fileName, { type: blob.type })
  
      const { error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })
  
      if (error) {
        console.error('Error uploading avatar:', error)
        return null;
      }
  
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)
      
      return data.publicUrl
    } catch (error) {
      console.error('Error in avatar upload process:', error)
      return null
    }
  };

  const logout = async () => {
    try {
      const response = await fetch('/api/v1/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Logout failed')

      if (web3auth?.connected) await web3auth.logout()

      setUser(null)
      router.push('/')
    } catch (error) {
      console.error('Error during logout:', error)
      throw error
    }
  };

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/v1/auth/me', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Error checking authentication:', error)
      setUser(null)
    }
  }

  if (isLoading) {
    return <Loading />
  }
  
  return (
    <AuthContext.Provider value={{ user, login, logout, getProvider, getSepoliaBalance }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider')
  return context
}