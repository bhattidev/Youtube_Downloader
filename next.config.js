/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Add configuration for serverless functions
  experimental: {
    serverComponentsExternalPackages: ['youtube-dl-exec', 'yt-dlp-wrap', 'ytdl-core']
  },
  // Configure output for Vercel
  output: 'standalone',
  // Add environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  }
}

module.exports = nextConfig 