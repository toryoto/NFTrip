'use client'

import { motion } from 'framer-motion'

export const Loading: React.FC = () => (
  <motion.div 
    className="fixed inset-0 bg-gray-900 flex items-center justify-center z-50"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <div className="animate-spin rounded-full h-24 w-24 sm:h-32 sm:w-32 border-t-2 border-b-2 border-blue-500"></div>
  </motion.div>
)