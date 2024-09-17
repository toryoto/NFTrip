import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  wallet_address: string;
  isLoggingOut: boolean;
  onLogout: () => void;
}

const sliceWalletAddress = (str: string, startChars: number, endChars: number) => {
  if (str.length <= startChars + endChars) return str;
  return `${str.slice(0, startChars)}...${str.slice(-endChars)}`;
};

const Header: React.FC<HeaderProps> = ({ wallet_address, isLoggingOut, onLogout }) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60">
      <div className="container flex flex-col items-center py-4 md:flex-row md:justify-between">
        <h1 className="text-3xl font-bold text-blue-400 mb-2 md:mb-0">
          Find NFT Spots
        </h1>
        <Link href={`/profile/${wallet_address}`} className="flex items-center space-x-2">
          <div className="text-sm font-medium text-gray-300">{sliceWalletAddress(wallet_address, 4,3)}</div>
          <div className="relative w-8 h-8 rounded-full overflow-hidden">
            <Image
              src="/images/no-user-icon.png"
              alt="User Avatar"
              style={{ objectFit: 'contain' }}
              fill
              sizes="128px"
            />
          </div>
        </Link>
        <Button
          onClick={onLogout}
          disabled={isLoggingOut}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          {isLoggingOut ? (
            <span className="flex items-center">
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
      </div>
    </header>
  );
};

export default Header;