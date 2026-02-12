// next.config.ts
/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: true,
  },
};

export default nextConfig;
