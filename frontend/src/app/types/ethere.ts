import { Eip1193Provider } from 'ethers';

export interface ExtendedWindow extends Window {
  ethereum?: Eip1193Provider;
}