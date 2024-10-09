import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { ethers } from 'ethers';
import { getRpcUrl } from "@/app/actions/rpcUrl";

// チェーン設定を関数として定義
const getChainConfig = async () => ({
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0xaa36a7",
  rpcTarget: await getRpcUrl(),
  displayName: "Ethereum Sepolia Testnet",
  blockExplorerUrl: "https://sepolia.etherscan.io",
  ticker: "ETH",
  tickerName: "Ethereum",
  logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
  useCoreKitKey: true,
});

// Web3Auth初期化関数
export const initWeb3Auth = async (): Promise<Web3Auth> => {
  const chainConfig = await getChainConfig();
  const privateKeyProvider = new EthereumPrivateKeyProvider({
    config: { chainConfig },
  });

  const clientId = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID;
  if (!clientId) {
    throw new Error("WEB3AUTH_CLIENT_ID is not defined");
  }

  const web3auth = new Web3Auth({
    clientId,
    web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_MAINNET,
    privateKeyProvider,
  });

  await web3auth.initModal();
  return web3auth;
};

// Web3Auth接続関数
export const connectWeb3Auth = async (web3auth: Web3Auth) => {
  const web3authProvider = await web3auth.connect();
  if (!web3authProvider) {
    throw new Error("Failed to connect to web3auth");
  }
  return new ethers.providers.Web3Provider(web3authProvider);
};

// アカウント情報取得関数
export const getWeb3AuthAccountInfo = async (web3auth: Web3Auth) => {
  try {
    const user = await web3auth.getUserInfo();
    const ethersProvider = await connectWeb3Auth(web3auth);
    const signer = await ethersProvider.getSigner();
    const address = await signer.getAddress();
    const balance = await ethersProvider.getBalance(address);

    return { user, address, signer };
  } catch (error) {
    console.error("Error getting account info:", error);
    throw error;
  }
};