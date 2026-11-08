import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  redirects() {
    return [
      // The v1 site is static HTML in public/v1. Next.js doesn't serve index.html for a
      // folder, and the page's relative asset paths only resolve from inside /v1/.
      { source: "/v1", destination: "/v1/index.html", permanent: false },
    ];
  },
};

export default nextConfig;
