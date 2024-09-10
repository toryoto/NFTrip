import { ethers } from "ethers";
import TouristNFTABI from '../../abi/TouristNFT.json';
import { useAuth } from '../app/contexts/AuthContext';
import { AuthMethod } from '../app/types/auth';

const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

export function useSmartContractInteractions() {
  const { getProvider } = useAuth();

  const getContract = async (method: AuthMethod) => {
    const provider = await getProvider(method);
    const signer = await provider.getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, TouristNFTABI.abi, signer);
  }

  const getAllLocationIds = async (method: AuthMethod): Promise<bigint[]> => {
    try {
      const contract = await getContract(method);
      const addedLocationIds = await contract.getAllLocationIds();
      return addedLocationIds;
    } catch (error) {
      console.error('Error checking active location:', error);
      return [];
    };  
  };

  const mintNFT = async (method: AuthMethod, locationId: number, tokenURI: string) => {
    try {
      const contract = await getContract(method);
      const tx = await contract.mint(locationId, tokenURI);
      const receipt = await tx.wait();
      return receipt.transactionHash;
    } catch (error) {
      console.error("Mint process failed:", error);
      throw error;
    }
  }

  return {
    getAllLocationIds,
    mintNFT
  }
}