import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["res.cloudinary.com", "images.unsplash.com", "bjhuvekaehvyzzptszmq.supabase.co"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.cdninstagram.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.fbcdn.net",
        pathname: "/**",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "100mb",
    },
  },
};

export default nextConfig;
