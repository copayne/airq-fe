/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

// Parse API hostname/port from GraphQL endpoint for image configuration.
// Falls back to GRAPHQL_BACKEND_URL when the public endpoint is a relative proxy path.
const graphqlEndpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:5000/graphql';
let apiHostname = 'localhost';
let apiPort = '5000';
/** @type {"http" | "https"} */
let apiProtocol = /** @type {"http" | "https"} */ ('http');
try {
  const apiUrl = new URL(graphqlEndpoint);
  apiHostname = apiUrl.hostname;
  apiPort = apiUrl.port || (apiUrl.protocol === 'https:' ? '443' : '80');
  apiProtocol = /** @type {"http" | "https"} */ (apiUrl.protocol.replace(':', ''));
} catch {
  // Relative URL (e.g. /api/graphql-proxy in dev mode) — use defaults
}

// Backend GraphQL target for rewrites (server-side only, not exposed to browser)
const graphqlBackend = process.env.GRAPHQL_BACKEND_URL || 'http://airq-api:5000';

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: false,

  /**
   * If you are using `appDir` then you must comment the below `i18n` config out.
   *
   * @see https://github.com/vercel/next.js/issues/41980
   */
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
  transpilePackages: ["geist"],

  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  compiler: {},

  async rewrites() {
    return [
      {
        source: '/api/graphql-proxy',
        destination: `${graphqlBackend}/graphql`,
      },
      {
        source: '/api/ring-snapshots/:path*',
        destination: `${graphqlBackend}/api/ring-snapshots/:path*`,
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: apiProtocol,
        hostname: apiHostname,
        port: apiPort,
        pathname: '/api/ring-snapshots/**',
      },
    ],
  },

  webpack: (config, { isServer }) => {
    // Fix for ring-client-api and other packages that use Node.js built-ins
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        path: false,
        os: false,
        'ring-client-api': false,
      };
    }
    return config;
  },
};

export default withBundleAnalyzer(config);
