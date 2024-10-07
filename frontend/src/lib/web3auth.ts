import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { ethers } from 'ethers';

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0xaa36a7",
  rpcTarget: "https://rpc.ankr.com/eth_sepolia",
  displayName: "Ethereum Sepolia Testnet",
  blockExplorerUrl: "https://sepolia.etherscan.io",
  ticker: "ETH",
  tickerName: "Ethereum",
  logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
  useCoreKitKey: true,
};
const privateKeyProvider = new EthereumPrivateKeyProvider({
  config: { chainConfig },
});

const clientId = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID;

export const web3auth = new Web3Auth({
  clientId: clientId || '',
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_MAINNET,
  privateKeyProvider,
});

export const initWeb3Auth = async (): Promise<Web3Auth> => {
  const web3authModule = await import('@/lib/web3auth');
  const web3authInstance = web3authModule.web3auth;
  await web3authInstance.initModal();
  return web3authInstance;
};

export const connectWeb3Auth = async (web3auth: Web3Auth) => {
  const web3authProvider = await web3auth.connect();
  if (!web3authProvider) {
    throw new Error("Failed to connect to web3auth");
  }
  return new ethers.BrowserProvider(web3authProvider);
};

export const getWeb3AuthAccountInfo = async (web3auth: Web3Auth) => {
  const user = await web3auth.getUserInfo();
  const ethersProvider = await connectWeb3Auth(web3auth);
  const signer = await ethersProvider.getSigner();
  const address = await signer.getAddress();
  const balance = await ethersProvider.getBalance(address);
  const balanceInEther = ethers.formatEther(balance);
  console.log("User Info:", user);
  console.log("Address:", address);
  console.log("Signer:", signer);
  console.log("Balance:", balanceInEther);
};