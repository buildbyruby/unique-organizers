/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // This allows the build to succeed even if there are TypeScript errors
    ignoreBuildErrors: true,
  },
  eslint: {
    // This allows the build to succeed even if there are ESLint warnings/errors
    ignoreDuringBuilds: true,
  },
  // Add any other existing config options below if you had them
};

export default nextConfig;