'use client'

import { ethers } from "ethers";
import TouristNFTABI from '../../abi/TouristNFT.json';
import { useAuth } from '../app/contexts/AuthContext';
import { AuthMethod } from '../app/types/auth';

const CONTRACT_ADDRESS = '0xe075066926eAe97a438DC5680edFD7D3232168E8';

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
  };

  const fetchMyNFTs = async (method: AuthMethod) => {
    try {
      const contract = await getContract(method);
      const signer = await (await getProvider(method)).getSigner();
      const myAddress = await signer.getAddress();

      let balance = BigInt(0);
      balance = await contract.balanceOf(myAddress);

      const nfts = []
      for (let i = 0; i < balance; i++) {
        const tokenId = await contract.tokenOfOwnerByIndex(myAddress, i);
        const tokenURI = await contract.tokenURI(tokenId);
        nfts.push(tokenURI);
      }

      return nfts;
    } catch (error) {
      console.error('Error fetching NFTs:', error);
    }
  };

  const getNFTAmount = async (method: AuthMethod) => {
    try {
      const contract = await getContract(method);
      const signer = await (await getProvider(method)).getSigner();
      const myAddress = await signer.getAddress();
      const balance = await contract.balanceOf(myAddress);
      return balance;
    } catch (error) {
      console.error('Error fetching NFT amount:', error);
    }
  };

  return {
    getAllLocationIds,
    mintNFT,
    fetchMyNFTs,
    getNFTAmount
  }
}