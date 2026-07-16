import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emit a minimal, self-contained server bundle for slim container images.
  output: "standalone",
};

export default nextConfig;
