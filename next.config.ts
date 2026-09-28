import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Images are served from the R2 CDN domain via plain <img> tags with
  // aspect-ratio boxes + blur placeholders, so no remotePatterns are needed.
  images: {
    unoptimized: false,
  },
};

export default nextConfig;
