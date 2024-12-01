export type AuthMethod = 'metamask' | 'web3auth'
import { ethers } from 'ethers'

export interface User {
  id: number
  wallet_address: string
  auth_type: AuthMethod
  total_nfts: number
}

export interface UserProfile {
  id: number
  name: string
  bio: string
  avatar_url: string
  email: string
}

export interface AuthContextType {
  user: User | null
  login: (method: AuthMethod) => Promise<void>
  logout: () => Promise<void>
  getProvider: (method: AuthMethod) => Promise<ethers.providers.Web3Provider>
  getSepoliaBalance: (method: AuthMethod) => Promise<string>
}
