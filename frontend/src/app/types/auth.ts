export type AuthMethod = 'metamask' | 'web3auth';
import { BrowserProvider } from 'ethers';

export interface User {
  id: number;
  wallet_address: string;
  auth_type: AuthMethod;
}

export interface UserProfile {
  id: number
  name: string
  bio: string
  avatar_url: string
  email: string
}

export interface AuthContextType {
  user: User;
  login: (method: AuthMethod) => Promise<void>;
  logout: () => Promise<void>;
  getProvider: (method: AuthMethod) => Promise<BrowserProvider>
}