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
            {
                protocol: "https",
                hostname: "pub-f82ee914a7694a7db796f247f32d32d2.r2.dev",
            },
        ],
    },
    async headers() {
        return [
            {
                source: "/:path*",
                headers: [
                    {
                        key: "X-DNS-Prefetch-Control",
                        value: "on",
                    },
                    {
                        key: "Strict-Transport-Security",
                        value: "max-age=63072000; includeSubDomains; preload",
                    },
                    {
                        key: "X-Content-Type-Options",
                        value: "nosniff",
                    },
                    {
                        key: "X-Frame-Options",
                        value: "SAMEORIGIN",
                    },
                    {
                        key: "Referrer-Policy",
                        value: "strict-origin-when-cross-origin",
                    },
                    {
                        key: "Content-Security-Policy",
                        value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net https://vercel.live; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https://*.googleusercontent.com https://*.pinimg.com https://assets.getliner.com https://*.r2.dev https://avatar.vercel.sh; font-src 'self'; connect-src 'self' https://*.supabase.co https://*.r2.cloudflarestorage.com; media-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';",
                    }
                ],
            },
        ];
    },
};

export default nextConfig;
