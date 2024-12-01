'use server'

export async function getRpcUrl() {
  const rpcUrl = `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
  return rpcUrl
}
