'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserProvider } from 'ethers';
import { User, AuthMethod, AuthContextType } from '../types/auth';
import { ExtendedWindow } from '../types/ethere';
import { Loading } from '../components/Loading';
import { useRouter } from 'next/navigation';
import { initWeb3Auth, getWeb3AuthAccountInfo } from '@/lib/web3auth';
import { Web3Auth } from "@web3auth/modal";

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

  const getProvider = async (method: AuthMethod): Promise<BrowserProvider> => {
    if (method === 'metamask') {
      const ethereum = (window as ExtendedWindow).ethereum;
      if (!ethereum) {
        throw new Error('MetaMask not detected');
      }
      await ethereum.request({ method: 'eth_requestAccounts' });
      return new BrowserProvider(ethereum);
    } else {
      if (!web3auth) {
        throw new Error('Web3Auth not initialized');
      }
      const web3authProvider = await web3auth.connect();
      return new BrowserProvider(web3authProvider as any);
    }
  };

  const getAddress = async (provider: BrowserProvider): Promise<string> => {
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

      const { user: newUser } = await response.json();

      setUser(newUser);

      return newUser;
    } catch (error) {
      console.error(`Error during ${method} login:`, error);
      throw error;
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