import type { NextConfig } from "next";
import { withSerwist } from "@serwist/turbopack";

const nextConfig: NextConfig = {
  transpilePackages: ["@mizline/shared"],
};

export default withSerwist(nextConfig);
