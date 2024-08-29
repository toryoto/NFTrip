import React from 'react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-800 py-4 text-center text-gray-400">
      <p>&copy; {currentYear} Find NFT Spots. All rights reserved.</p>
    </footer>
  )
}