import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@patient-app/shared-types"],
};

export default nextConfig;
