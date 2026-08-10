import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const nextConfig: NextConfig = {
  images: {
    localPatterns: [{ pathname: "/cms-api/media/file/**" }],
  },
  turbopack: { root: dirname },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      ".cjs": [".cts", ".cjs"],
      ".js": [".ts", ".tsx", ".js", ".jsx"],
      ".mjs": [".mts", ".mjs"],
    };
    webpackConfig.resolve.alias["@payload-config"] = path.resolve(dirname, "payload.config.ts");
    return webpackConfig;
  },
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
