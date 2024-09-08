export type AuthMethod = 'metamask' | 'web3auth';
import { BrowserProvider } from 'ethers';

export interface User {
  id: string;
  wallet_address: string;
  auth_type: AuthMethod;
}

export interface AuthContextType {
  user: User | null;
  login: (method: AuthMethod) => Promise<void>;
  logout: () => Promise<void>;
  getProvider: (method: AuthMethod) => Promise<BrowserProvider>
}