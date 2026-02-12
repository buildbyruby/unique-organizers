import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* next.config.ts options 
     (appDir and swcMinify are default in Next.js 16, so we removed them)
  */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
};

export default nextConfig;