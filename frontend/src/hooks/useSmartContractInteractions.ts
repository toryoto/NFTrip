import { ethers } from "ethers";
import TouristNFTABI from '../../abi/TouristNFT.sol/TouristNFT.json';
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

  const isActiveLocation = async (locationId: number, method: AuthMethod): Promise<boolean> => {
    try {
      const contract = await getContract(method);
      const isActive = await contract.isActiveLocation(locationId);
      return isActive;
    } catch (error) {
      console.error('Error checking active location:', error);
      return false;
    };  
  };

  return {
    isActiveLocation
  }
}