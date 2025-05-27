/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Configure API routes
  api: {
    responseLimit: '50mb',
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
  // Configure output for Vercel
  output: 'standalone',
  // Add environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  }
}

module.exports = nextConfig 