import { ethers } from 'ethers';
import { Biconomy } from "@biconomy/mexa";
import { ExtendedWindow } from "@/app/types/ethere";

export const getBiconomyProvider = async (): Promise<ethers.providers.Web3Provider> => {
  const ethereum = (window as ExtendedWindow).ethereum;
  if (!ethereum) {
    throw new Error("Ethereum provider is not available");
  }

  const biconomy = new Biconomy(ethereum as any, {
    apiKey: "pEBko1MPn.96b73a50-17a4-414f-9ddd-9cf0e700f2df",
    debug: true,
    contractAddresses: ['0x5e837921E12fDdB23b0766792366384B68Df6244'],
  });

	try {
		await biconomy.init();
		const provider = new ethers.providers.Web3Provider(biconomy.provider as any);
  	return provider;
	} catch (error) {
		console.error("Biconomy initialization failed", error);
		throw new Error("aaaaaaaaa")
	}
};