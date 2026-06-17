import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@mizline/shared"],
  experimental: {
    optimizePackageImports: ["recharts"],
  },
};

export default nextConfig;
