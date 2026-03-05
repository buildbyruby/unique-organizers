import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // We removed output: 'standalone' because Vercel doesn't need it
  // and it's what was crashing the middleware trace.
  
  serverExternalPackages: ['@prisma/client', 'pg'],

  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' }, 
      { protocol: 'https', hostname: '**.supabase.co' },             
      { protocol: 'https', hostname: 'images.google.com' },
      { protocol: 'https', hostname: '**.googleusercontent.com' },
      { protocol: 'https', hostname: '**.gstatic.com' },
    ],
  },
};

export default nextConfig;