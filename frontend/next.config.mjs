/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'chocolate-secret-cat-833.mypinata.cloud',
        pathname: '/ipfs/**'
      },
      {
        protocol: 'https',
        hostname: 'ipfs.io',
        pathname: '/ipfs/**'
      }
    ],
    domains: ['hbdlgkqiqnzkdlzrcihg.supabase.co']
  },
  i18n: {
    locales: ['ja'],
    defaultLocale: 'ja'
  }
}

export default nextConfig
