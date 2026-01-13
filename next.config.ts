import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.pinimg.com"
      },
      {
        protocol: "https",
        hostname: "assets.getliner.com"
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com"
      },

    ]
  }
};

export default nextConfig;
