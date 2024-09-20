'use client'

import { ethers } from "ethers";
import TouristNFTABI from '../../abi/TouristNFT.json';
import { useAuth } from '../app/contexts/AuthContext';
import { AuthMethod } from '../app/types/auth';
import { supabase } from "@/lib/supabase";

const CONTRACT_ADDRESS = '0xb15C65F0280b03000487C37E47C9BF73970eD789';

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

      // ミント後のユーザのNFT総数をオンチェーンから取得してDBを更新
      await updateTotalNFTs(method);
      return receipt.transactionHash;
    } catch (error) {
      console.error("Mint process failed:", error);
      throw error;
    }
  };

  const updateTotalNFTs = async (method: AuthMethod) => {
    try {
      const contract = await getContract(method);
      const signer = await (await getProvider(method)).getSigner();
      const myAddress = await signer.getAddress();

      const balance = await contract.balanceOf(myAddress);
      const balanceNumber = Number(balance);
      
      const { error } = await supabase
        .from('users')
        .update({ total_nfts: balanceNumber })
        .eq('wallet_address', myAddress);

      if (error) {
        console.error('Error updating total NFTs:', error);
      }
    } catch (error) {
      console.error('Error fetching total NFTs:', error);
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


  async function burnAllNFTs(method: AuthMethod) {
    try {
      const contract = await getContract(method);
      const signer = await (await getProvider(method)).getSigner();
      const myAddress = await signer.getAddress();
  
      // ユーザーの現在のNFT残高を取得
      let balance = await contract.balanceOf(myAddress);
      let initialBalance = Number(balance);
  
      console.log(`Initial NFT balance: ${initialBalance}`);
  
      // 全てのNFTをバーン
      for (let i = initialBalance - 1; i >= 0; i--) {
        try {
          // トークンIDを取得
          const tokenId = await contract.tokenOfOwnerByIndex(myAddress, i);
          
          // バーン処理
          const tx = await contract.burn(tokenId);
          await tx.wait();
  
          console.log(`Burned NFT with token ID: ${tokenId}`);
        } catch (error) {
          console.error(`Failed to burn NFT at index ${i}:`, error);
        }
      }
  
      // 最終的なNFT残高を取得
      balance = await contract.balanceOf(myAddress);
      let finalBalance = Number(balance);
  
      console.log(`Final NFT balance: ${finalBalance}`);
  
      // Supabaseのユーザーレコードを更新
      const { data, error } = await supabase
        .from('users')
        .update({ total_nfts: finalBalance })
        .eq('wallet_address', myAddress)
        .select();
  
      if (error) {
        console.error('Error updating total NFTs in database:', error);
      } else {
        console.log('Total NFTs updated in database:', finalBalance);
      }
  
      return initialBalance - finalBalance; // バーンされたNFTの数を返す
    } catch (error) {
      console.error("Burn all NFTs process failed:", error);
      throw error;
    }
  }

  return {
    getAllLocationIds,
    mintNFT,
    fetchMyNFTs,
    burnAllNFTs,
  }
}