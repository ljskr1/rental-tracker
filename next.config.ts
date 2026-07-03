import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pictures.realestate.com.au',
      },
      {
        protocol: 'https',
        hostname: '*.realestate.com.au',
      },
      {
        protocol: 'https',
        hostname: 'photos.domain.com.au',
      },
    ],
  },
};

export default nextConfig;