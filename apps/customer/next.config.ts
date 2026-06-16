import type { NextConfig } from "next";
import { withSerwist } from "@serwist/turbopack";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@mizline/shared"],
};

export default withSerwist(nextConfig);
