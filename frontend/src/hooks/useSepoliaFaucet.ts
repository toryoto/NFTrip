'use client'

import { ethers } from "ethers";
import SepoliaFaucet from '../../abi/SepoliaFaucet.json';
import MinimalForwarder from '../../abi/MinimalForwarder.json';
import { useAuth } from '../app/contexts/AuthContext';
import { AuthMethod } from '../app/types/auth';
import { useState } from "react";

const FAUCET_ADDRESS = '0x3dA5c533d839e7a03B1D1a674456dBCf52759d88';
const FORWARDER_ADDRESS = '0x56823B1E1eFcb375774AE955cCE6B1960F083C70';

export function useSepoliaFaucet() {
  const { getProvider } = useAuth();
  const [receipt, setReceipt] = useState<any | null>(null);

  const getContract = async (method: AuthMethod) => {
    const provider = await getProvider(method);
    const signer = provider.getSigner();
    return new ethers.Contract(FAUCET_ADDRESS, SepoliaFaucet.abi, signer);
  }

  // メタトランザクション用の関数を追加
  const createMetaTx = async (method: AuthMethod) => {
    const provider = await getProvider(method);
    const userSigner = provider.getSigner();
    const userAddress = await userSigner.getAddress();

    // Forwarderのnonceを取得
    const forwarder = new ethers.Contract(
      FORWARDER_ADDRESS,
      MinimalForwarder.abi,
      provider
    );
    const nonce = await forwarder.getNonce(userAddress);
    console.log(nonce)

    // トランザクションデータの作成
    const faucetInterface = new ethers.utils.Interface(SepoliaFaucet.abi);
    const data = faucetInterface.encodeFunctionData('requestTokens', []);

    const request = {
      from: userAddress,
      to: FAUCET_ADDRESS,
      value: ethers.utils.hexValue(0),
      gas: ethers.utils.hexValue(300000),
      nonce: nonce.toString(),
      data
    };

    // 署名の作成
    const domain = {
      name: 'MinimalForwarder',
      version: '0.0.1',
      chainId: (await provider.getNetwork()).chainId,
      verifyingContract: FORWARDER_ADDRESS
    };

    const types = {
      ForwardRequest: [
        { name: 'from', type: 'address' },
        { name: 'to', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'gas', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'data', type: 'bytes' }
      ]
    };

    const signature = await userSigner._signTypedData(domain, types, request);
    return { request, signature };
  };

  const requestTokensGasless = async (method: AuthMethod) => {
    console.log(111)
    try {
      // メタトランザクションの作成と署名
      const { request, signature } = await createMetaTx(method);
      console.log(receipt, signature)

      // Relayerへの送信
      const response = await fetch('/api/v1/relayer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ request, signature }),
      });

      const data = await response.json();
      console.log(data)
      if (data.success) {
        setReceipt(data.receipt);
        return data.receipt;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Gasless transaction failed:", error);
      throw error;
    }
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
    requestTokens: requestTokensGasless,
    setWithdrawalAmount,
    setLockTime,
    withdrawContractBalance
  }
}