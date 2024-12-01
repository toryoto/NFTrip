'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { LogOut, Menu, X, Droplet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '../contexts/AuthContext'
import { useUserProfile } from '@/hooks/useUserProfile'
import Web3WalletModal from './WalletModal'

const Header: React.FC = () => {
  const { user, logout } = useAuth()
  const { userProfile } = useUserProfile(user?.id)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const sliceWalletAddress = (str: string, startChars: number, endChars: number) => {
    if (str.length <= startChars + endChars) return str
    return `${str.slice(0, startChars)}...${str.slice(-endChars)}`
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-black/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <Link href='/dashboard' className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
              NFTrip
            </h1>
          </Link>
          <div className="hidden md:flex items-center space-x-4 ml-auto">
            <Web3WalletModal />
            <Link href={`/profile/${user.id}`}>
              <UserInfo user={user} userProfile={userProfile} sliceWalletAddress={sliceWalletAddress} />
            </Link>
            <Link href="/faucet/sepolia">
              <FaucetLink />
            </Link>
            <LogoutButton isLoggingOut={isLoggingOut} handleLogout={handleLogout} />
          </div>
          <div className="md:hidden">
            <Button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              variant="ghost"
              size="icon"
              className="text-gray-300 hover:text-white hover:bg-gray-800 transition-colors duration-200"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden bg-gray-900 py-4 border-t border-gray-800">
          <div className="container mx-auto px-4 space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="block">
                <div className="flex bg-gray-800 p-3 rounded-lg items-center">
                  <Web3WalletModal />
                </div>
              </div>
              <Link href={`/profile/${user.id}`} className="block">
                <div className="flex bg-gray-800 p-3 rounded-lg items-center">
                  <UserInfo user={user} userProfile={userProfile} sliceWalletAddress={sliceWalletAddress} />
                </div>
              </Link>
              <Link href="/faucet/sepolia" className="block">
                <div className="flex bg-gray-800 p-3 rounded-lg items-center">
                  <FaucetLink />
                </div>
              </Link>
            </div>
            <LogoutButton isLoggingOut={isLoggingOut} handleLogout={handleLogout} />
          </div>
        </div>
      )}
    </header>
  )
}

const UserInfo: React.FC<{ user: any; userProfile: any; sliceWalletAddress: (str: string, startChars: number, endChars: number) => string }> = ({ user, userProfile, sliceWalletAddress }) => (
  <div className="flex items-center space-x-3">
    <div className="relative w-10 h-10 rounded-full overflow-hidden">
      <Image
        src={userProfile?.avatar_url || '/images/no-user-icon.png'}
        alt="User Avatar"
        style={{ objectFit: 'cover' }}
        className="transition-opacity duration-300 group-hover:opacity-75"
        fill
        sizes="40px"
      />
    </div>
    <div>
      <div className="text-sm font-medium text-white">{sliceWalletAddress(user.wallet_address, 4, 3)}</div>
      <div className="text-xs text-gray-400">View Profile</div>
    </div>
  </div>
)

const FaucetLink: React.FC = () => (
  <div className="flex items-center space-x-3 sm:bg-transparent sm:p-0 rounded-lg">
    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-blue-500 flex items-center justify-center">
      <Droplet className="w-6 h-6 text-white" />
    </div>
    <div>
      <div className="text-sm font-medium text-white">Faucet</div>
      <div className="text-xs text-gray-400">Get Sepolia ETH</div>
    </div>
  </div>
)

const LogoutButton: React.FC<{ isLoggingOut: boolean; handleLogout: () => void }> = ({ isLoggingOut, handleLogout }) => (
  <Button
    onClick={handleLogout}
    disabled={isLoggingOut}
    className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white transition-colors duration-200"
  >
    {isLoggingOut ? (
      <span className="flex items-center justify-center">
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Logging out...
      </span>
    ) : (
      <>
        <LogOut className="w-4 h-4 mr-2" />
        Logout
      </>
    )}
  </Button>
)

export default Header