'use client'

import { ethers } from "ethers";
import TouristNFTABI from '../../abi/NFTrip.json';
import { useAuth } from '../app/contexts/AuthContext';
import { AuthMethod } from '../app/types/auth';
import { supabase } from "@/lib/supabase";

const CONTRACT_ADDRESS = '0xbe7EeFb23E7B970fcC05F061ba22A0E8dAd94518';

export function useSmartContractInteractions() {
  const { getProvider } = useAuth();

  const getContract = async (method: AuthMethod) => {
    const provider = await getProvider(method);
    const signer = provider.getSigner();
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

      // イベントリスナーを設定
      const eventPromise = listenForNFTMinted(contract);
      
      const tx = await contract.mint(locationId, tokenURI);
      await tx.wait();

      // イベントからトランザクションハッシュを取得
      const transactionHash = await eventPromise;

      const provider = await getProvider(method);
      const signer = provider.getSigner();
      const myAddress = await signer.getAddress();
      const balance = await contract.balanceOf(myAddress);
      const balanceNumber = balance.toNumber();

      return { transactionHash, balanceNumber };
    } catch (error) {
      console.error("Mint process failed:", error);
      throw error;
    }
  };

  const fetchMyNFTs = async (method: AuthMethod, wallet_address: string) => {
    try {
      const contract = await getContract(method);

      let balance = BigInt(0);
      balance = await contract.balanceOf(wallet_address);

      const nfts = []
      for (let i = 0; i < balance; i++) {
        const tokenId = await contract.tokenOfOwnerByIndex(wallet_address, i);
        const tokenURI = await contract.tokenURI(tokenId);
        nfts.push(tokenURI);
      }
      return nfts;
    } catch (error) {
      console.error('Error fetching NFTs:', error);
    }
  };

  const listenForNFTMinted = (contract: ethers.Contract): Promise<string> => {
    return new Promise((resolve, reject) => {
      
      const listener = (...args: any[]) => {
        const event = args[args.length - 1];
        resolve(event.transactionHash);
      };
  
      contract.on("NFTMinted", listener);
    });
  };
  

  async function burnAllNFTs(method: AuthMethod) {
    try {
      const contract = await getContract(method);
      const provider = await getProvider(method);
      const signer = provider.getSigner();
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