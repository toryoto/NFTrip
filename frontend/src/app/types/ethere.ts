import { ethers } from 'ethers';

// v5では、ExternalProviderを使用します
export interface ExtendedWindow extends Window {
  ethereum?: ethers.providers.ExternalProvider;
}
