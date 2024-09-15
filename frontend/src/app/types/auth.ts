export type AuthMethod = 'metamask' | 'web3auth';
import { BrowserProvider } from 'ethers';

export interface User {
  id: string;
  wallet_address: string;
  auth_type: AuthMethod;
}

export interface UserProfile {
  id: number
  name: string
  bio: string | null
  avatar_url: string | null
  email: string | null
}

export interface AuthContextType {
  user: User | null;
  login: (method: AuthMethod) => Promise<void>;
  logout: () => Promise<void>;
  getProvider: (method: AuthMethod) => Promise<BrowserProvider>
}