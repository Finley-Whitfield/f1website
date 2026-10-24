/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  onDemandEntries: {
    maxInactiveAge: 2 * 60 * 1000,
    pagesBufferLength: 16,
  },
  experimental: {
    cpus: 1,
    optimizePackageImports: ["framer-motion"],
  },
};
export default nextConfig;
