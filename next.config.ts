import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // reactCompiler: true,
  images: {
    remotePatterns: [{ hostname: "images.unsplash.com" }],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
    // Increase the body size limit for middleware/proxy
    // Default is 10MB — needs to match or exceed serverActions bodySizeLimit
    proxyClientMaxBodySize: "50mb",
  },

  logging: {
    fetches: {
      fullUrl: false,
    },
  },
};

export default nextConfig;
