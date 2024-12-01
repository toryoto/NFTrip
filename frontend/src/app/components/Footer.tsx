import React from 'react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-800 py-4 text-center text-gray-400">
      <p>&copy; {currentYear} NFTrip. All rights reserved.</p>
    </footer>
  )
}
