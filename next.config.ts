import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactStrictMode: false, // ← 이 줄 추가

    devIndicators: false,
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "i.pinimg.com",
            },
            {
                protocol: "https",
                hostname: "assets.getliner.com",
            },
            {
                protocol: "https",
                hostname: "lh3.googleusercontent.com",
            },
        ],
    },
};

export default nextConfig;
