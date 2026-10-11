import type { NextConfig } from "next";

const BACKEND_URL = "https://api.researchbridge.uz/api";
const BACKEND_ORIGIN = "https://api.researchbridge.uz"; // /files uchun
const COURSE_BANNERS_BACKEND_URL = "https://api.researchbridge.uz";

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/:path*`,
      },
      {
        source: "/files/:path*",
        destination: `${BACKEND_ORIGIN}/files/:path*`,
      },
      {
        source: "/course-banners/:path*",
        destination: `${COURSE_BANNERS_BACKEND_URL}/files/:path*`,
      },
    ];
  },
};

export default nextConfig;