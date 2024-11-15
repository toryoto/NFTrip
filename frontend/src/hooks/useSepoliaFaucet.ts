'use client'

import { ethers } from "ethers";
import SepoliaFaucet from '../../abi/SepoliaFaucet.json';
import { useAuth } from '../app/contexts/AuthContext';
import { AuthMethod } from '../app/types/auth';


const CONTRACT_ADDRESS = '0x674B946AFC2Bb99411fC9092A9921db656A56473';

export function useSepoliaFaucet() {
  const { getProvider } = useAuth();

  const getContract = async (method: AuthMethod) => {
    const provider = await getProvider(method);
    const signer = provider.getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, SepoliaFaucet.abi, signer);
  }

	// スマートコントラクトのSepolia Faucetを実行する
  const requestTokens = async (method: AuthMethod) => {
    try {
      const contract = await getContract(method);

			const tx = await contract.requestTokens();
      await tx.wait();

      const receipt = await tx.wait();

      return receipt.transactionHash;
    } catch (error) {
      console.error("Faucet process failed:", error);
      throw error;
    }
  };


  const listenForWithdrawal = (contract: ethers.Contract): Promise<string> => {
    return new Promise((resolve, reject) => {
      const listener = (to: string, amount: ethers.BigNumber, event: ethers.Event) => {
        resolve(event.transactionHash);
        contract.off("Withdrawal", listener);
      };
  
      contract.on("Withdrawal", listener);
    });
  };

	const setWithdrawalAmount = async (method: AuthMethod, newAmount: number) => {
    try {
      const contract = await getContract(method);
      const tx = await contract.setWithdrawalAmount(ethers.utils.parseEther(newAmount.toString()));
      await tx.wait();
    } catch (error) {
      console.error("Failed to set withdrawal amount:", error);
      throw error;
    }
  }

  const setLockTime = async (method: AuthMethod, newTime: number) => {
    try {
      const contract = await getContract(method);
      const tx = await contract.setLockTime(newTime);
      await tx.wait();
    } catch (error) {
      console.error("Failed to set lock time:", error);
      throw error;
    }
  }

  const withdrawContractBalance = async (method: AuthMethod) => {
    try {
      const contract = await getContract(method);
      const tx = await contract.withdraw();
      await tx.wait();
    } catch (error) {
      console.error("Failed to withdraw contract balance:", error);
      throw error;
    }
  }

  return {
    requestTokens,
    setWithdrawalAmount,
    setLockTime,
    withdrawContractBalance
  }
}