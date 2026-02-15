import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* No changes to dev origins */
  allowedDevOrigins: ['*.replit.dev', '*.spock.replit.dev', '*.repl.co', '*.picard.replit.dev'],
  images: {
    unoptimized: true, // This is the "Safety Switch" to prevent black boxes
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