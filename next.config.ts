import type { NextConfig } from "next";
import { resolve } from "path";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "imgs.search.brave.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.ibb.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "drive.google.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.googleusercontent.com", 
        pathname: "/**",
      },
    ],
  },
  webpack(config, _options) {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@tailwindcss/postcss": resolve(__dirname, "node_modules", "tailwindcss"),
    };
    return config;
  },
};

export default nextConfig;
