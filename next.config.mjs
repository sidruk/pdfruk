function isSearchEngineIndexingDiscouraged() {
  if (process.env.NODE_ENV === "development") return true;
  if (process.env.VERCEL_ENV === "preview") return true;

  const flag = process.env.SEARCH_ENGINE_INDEXING?.trim().toLowerCase();
  return flag === "discourage" || flag === "block" || flag === "no";
}

const discourageSearchEngineIndexing = isSearchEngineIndexingDiscouraged();

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
