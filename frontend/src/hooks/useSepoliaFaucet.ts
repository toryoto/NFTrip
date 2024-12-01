'use client'

import { ethers } from 'ethers'
import SepoliaFaucet from '../../abi/SepoliaFaucet.json'
import MinimalForwarder from '../../abi/MinimalForwarder.json'
import { useAuth } from '../app/contexts/AuthContext'
import { AuthMethod } from '../app/types/auth'

const FAUCET_ADDRESS = '0x3dA5c533d839e7a03B1D1a674456dBCf52759d88'
const FORWARDER_ADDRESS = '0x56823B1E1eFcb375774AE955cCE6B1960F083C70'

export function useSepoliaFaucet() {
  const { getProvider } = useAuth()

  const getContract = async (method: AuthMethod) => {
    const provider = await getProvider(method)
    const signer = provider.getSigner()
    return new ethers.Contract(FAUCET_ADDRESS, SepoliaFaucet.abi, signer)
  }

  const canWithdrawToken = async (method: AuthMethod) => {
    try {
      const provider = await getProvider(method)
      const balance = await provider.getBalance(FAUCET_ADDRESS)
      return parseFloat(ethers.utils.formatEther(balance)) >= 0.1
    } catch (error) {
      console.error('Failed to get token balance:', error)
      throw error
    }
  }

  const isNoTransactionWithin24Hours = async (address: string) => {
    try {
      const response = await fetch('/api/v1/faucet/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ address })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error)
      }

      return data.noRecentTransaction
    } catch (error) {
      console.error('Failed to perform action check:', error)
      throw error
    }
  }

  const validateFaucetTransaction = async (
    method: AuthMethod,
    walletAddress: string
  ) => {
    const canWithdraw = await canWithdrawToken(method)
    const isNoTransaction = await isNoTransactionWithin24Hours(walletAddress)
    if (!canWithdraw) {
      throw new Error('Faucet is empty')
    }
    if (!isNoTransaction) {
      throw new Error('Must wait 1 day between withdrawals')
    }
  }

  // メタトランザクション用の関数を追加
  const createMetaTx = async (method: AuthMethod) => {
    const provider = await getProvider(method)
    const userSigner = provider.getSigner()
    const userAddress = await userSigner.getAddress()

    // Forwarderのnonceを取得
    const forwarder = new ethers.Contract(
      FORWARDER_ADDRESS,
      MinimalForwarder.abi,
      provider
    )
    const nonce = await forwarder.getNonce(userAddress)

    // トランザクションデータの作成
    const faucetInterface = new ethers.utils.Interface(SepoliaFaucet.abi)
    const data = faucetInterface.encodeFunctionData('requestTokens', [])

    const request = {
      from: userAddress,
      to: FAUCET_ADDRESS,
      value: ethers.utils.hexValue(0),
      gas: ethers.utils.hexValue(300000),
      nonce: nonce.toString(),
      data
    }

    // 署名の作成
    const domain = {
      name: 'MinimalForwarder',
      version: '0.0.1',
      chainId: (await provider.getNetwork()).chainId,
      verifyingContract: FORWARDER_ADDRESS
    }

    const types = {
      ForwardRequest: [
        { name: 'from', type: 'address' },
        { name: 'to', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'gas', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'data', type: 'bytes' }
      ]
    }

    const signature = await userSigner._signTypedData(domain, types, request)
    return { request, signature }
  }

  const requestTokensGasless = async (
    method: AuthMethod,
    walletAddress: string
  ) => {
    // Faucetトランザクション発行前のバリデーション
    await validateFaucetTransaction(method, walletAddress)

    try {
      // メタトランザクションの作成と署名
      const { request, signature } = await createMetaTx(method)
      console.log(request, signature)

      // Relayerへの送信
      const response = await fetch('/api/v1/relayer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ request, signature })
      })

      const data = await response.json()
      if (data.success) {
        return data.receipt
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Gasless transaction failed:', error)
      throw error
    }
  }

  const setWithdrawalAmount = async (method: AuthMethod, newAmount: number) => {
    try {
      const contract = await getContract(method)
      const tx = await contract.setWithdrawalAmount(
        ethers.utils.parseEther(newAmount.toString())
      )
      await tx.wait()
    } catch (error) {
      console.error('Failed to set withdrawal amount:', error)
      throw error
    }
  }

  const setLockTime = async (method: AuthMethod, newTime: number) => {
    try {
      const contract = await getContract(method)
      const tx = await contract.setLockTime(newTime)
      await tx.wait()
    } catch (error) {
      console.error('Failed to set lock time:', error)
      throw error
    }
  }

  const withdrawContractBalance = async (method: AuthMethod) => {
    try {
      const contract = await getContract(method)
      const tx = await contract.withdraw()
      await tx.wait()
    } catch (error) {
      console.error('Failed to withdraw contract balance:', error)
      throw error
    }
  }

  return {
    requestTokens: requestTokensGasless,
    setWithdrawalAmount,
    setLockTime,
    withdrawContractBalance
  }
}
