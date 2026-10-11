import type { NextConfig } from "next";

const BACKEND_URL = "http://35.159.109.22:3000/api";
const BACKEND_ORIGIN = "http://35.159.109.22:3000"; // /files uchun
const COURSE_BANNERS_BACKEND_URL = "http://35.159.109.22:3000";

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