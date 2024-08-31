'use client'; 

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { BrowserProvider, JsonRpcSigner } from 'ethers';
import { supabase } from '@/lib/supabase';
import { web3auth } from '@/lib/web3auth';
import { User, AuthMethod, AuthContextType } from '../types/auth';

declare global {
  interface Window {
    ethereum?: ethers.Eip1193Provider;
  }
}

// createContextを使用して、認証情報を保持するコンテキストを作成する
// このコンテキストはアプリのどこからでも使用できる
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      await web3auth.initModal();
      checkAuth();
    };

    initAuth();
  }, []);

  const getProvider = async (method: AuthMethod): Promise<BrowserProvider> => {
    if (method === 'metamask') {
      if (!window.ethereum) {
        throw new Error('MetaMask not detected');
      }
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      return new BrowserProvider(window.ethereum);
    } else {
      const web3authProvider = await web3auth.connect();
      return new BrowserProvider(web3authProvider as any);
    }
  };

  const getAddress = async (provider: BrowserProvider): Promise<string> => {
    const signer = await provider.getSigner();
    return await signer.getAddress();
  };

  const callApi = async (wallet_address: string, auth_type: string) => {
    const response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ wallet_address, auth_type }),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    return await response.json();
  }

  const login = async (method: AuthMethod) => {
    try {
      const provider = await getProvider(method);
      const address = await getAddress(provider);
      const { user: newUser } = await callApi(address, method);

      setUser(newUser);
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

      if (web3auth.connected) await web3auth.logout();

      setUser(null);
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
    } finally {
      setLoading(false);
    }
  }

  return (
    // コンテキストのプロバイダーでアプリ全体にvalueを渡す
    // AuthContext.Providerは自動で生成される
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// コンポーネントでの認証関連処理を簡潔にするためにuseContextをラップしたuseAuthを実装
export const useAuth = () => {
  // AuthContextはuser,login,logoutを所持するコンテキスト
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};