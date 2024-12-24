import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "lh3.googleusercontent.com", // Google user profile photos
      "www.gravatar.com", // Default avatar fallback
    ],
  },
};

export default nextConfig;
