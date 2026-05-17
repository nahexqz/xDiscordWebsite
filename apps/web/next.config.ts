import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.discordapp.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "media.discordapp.net" },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
  outputFileTracingExcludes: {
    "*": [
      "./node_modules/@swc/core-linux-x64-gnu",
      "./node_modules/@swc/core-linux-x64-musl",
      "./node_modules/esbuild/linux",
      "./node_modules/webpack",
      "./node_modules/rollup",
      "./node_modules/terser",
    ],
  },
};

export default nextConfig;
