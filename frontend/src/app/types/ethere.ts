import { ethers } from 'ethers'

export interface ExtendedWindow extends Window {
  ethereum?: ethers.providers.ExternalProvider
}
