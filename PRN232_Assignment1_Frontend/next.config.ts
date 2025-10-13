import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-f9fde820e02a4976b08ee6caab4a7c92.r2.dev",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
