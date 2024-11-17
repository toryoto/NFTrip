'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { User, AuthMethod, AuthContextType } from '../types/auth';
import { ExtendedWindow } from '../types/ethere';
import { Loading } from '../components/Loading';
import { useRouter } from 'next/navigation';
import { initWeb3Auth, getWeb3AuthAccountInfo } from '@/lib/web3auth';
import { Web3Auth } from "@web3auth/modal";
import { supabase } from '@/lib/supabase';
import axios from 'axios';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);

      try {
        const web3authInstance = await initWeb3Auth();
        setWeb3auth(web3authInstance);

        await checkAuth();
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const getProvider = async (method: AuthMethod): Promise<ethers.providers.Web3Provider> => {
    if (method === 'metamask') {
      const ethereum = (window as ExtendedWindow).ethereum;
      if (!ethereum) {
        throw new Error('MetaMask not detected');
      }
      await ethereum.request?.({ method: 'eth_requestAccounts' });
      return new ethers.providers.Web3Provider(ethereum);
    } else {
      if (!web3auth) {
        throw new Error('Web3Auth not initialized');
      }
      const web3authProvider = await web3auth.connect();
      return new ethers.providers.Web3Provider(web3authProvider as any);
    }
  };

  const getAddress = async (provider: ethers.providers.Web3Provider): Promise<string> => {
    const signer = await provider.getSigner();
    return await signer.getAddress();
  };

  const login = async (method: AuthMethod) => {
    try {
      const provider = await getProvider(method);
      const address = await getAddress(provider);

      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ wallet_address: address, auth_type: method }),
        credentials: 'include',
      });
  
      if (!response.ok) {
        throw new Error('Login failed');
      }

      const { user: user, isNewUser } = await response.json();

      setUser(user);
      if (isNewUser && method === 'web3auth') await setWeb3AuthUserProfile(user)

      return user;
    } catch (error) {
      await logout()
      console.error(`Error during ${method} login:`, error);
      throw error;
    }
  };

  const setWeb3AuthUserProfile = async (user: User) => {
    try {
      const userInfo = await web3auth?.getUserInfo();
      if (userInfo) {
        console.log(userInfo)

        const avatar_url = await uploadAvatarFromUrl(userInfo.profileImage || '/images/no-user-icon.png', user.id)

        const { error } = await supabase
          .from('user_profiles')
          .update({ name: userInfo.name, email: userInfo.email, avatar_url: avatar_url })
          .eq('user_id', user.id)
          .single()
        
        if (error) throw error;
      }
		} catch (error) {
      await logout()
			console.log(`Failed to update user profile${error}`);
		}
  }

  const uploadAvatarFromUrl = async (url: string, userId: number): Promise<string | null> => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch the image');
      const blob = await response.blob();
  
      const fileExtension = blob.type.split('/')[1];
      const fileName = `${String(userId)}_avatar.${fileExtension}`;
  
      // blobをFileオブジェクトに変換
      const file = new File([blob], fileName, { type: blob.type });
  
      const { error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });
  
      if (error) {
        console.error('Error uploading avatar:', error);
        return null;
      }
  
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
      
      return data.publicUrl;
    } catch (error) {
      console.error('Error in avatar upload process:', error);
      return null;
    }
  };

  const logout = async () => {
    try {
      const response = await fetch('/api/v1/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Logout failed');

      if (web3auth?.connected) await web3auth.logout();

      setUser(null);
      router.push('/')
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  };

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/v1/auth/me', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      setUser(null);
    }
  }

  if (isLoading) {
    return <Loading />
  }
  
  return (
    <AuthContext.Provider value={{ user, login, logout, getProvider }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};