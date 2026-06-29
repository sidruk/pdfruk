const discourageSearchEngineIndexing =
  process.env.SEARCH_ENGINE_INDEXING?.trim().toLowerCase() !== "allow";

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["pdfjs-dist"],
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
  async headers() {
    if (!discourageSearchEngineIndexing) {
      return [];
    }

    return [
      {
        source: "/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex" }],
      },
    ];
  },
};

export default nextConfig;
