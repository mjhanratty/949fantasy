import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required when a parent directory has its own lockfile — otherwise Next infers the wrong root.
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
