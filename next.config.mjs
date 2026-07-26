// @ts-check

const isVercel = process.env.VERCEL === "1"
const isTermux = !isVercel && process.platform === "linux" && process.env.HOME?.includes("/data/data/com.termux")

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    qualities: [75, 90],
  },
  experimental: {
    useWasmBinary: true,
  },
  turbopack: {},
  webpack: (config) => {
    if (isTermux) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: [
          "**/node_modules/**",
          "/data/**",
          "/**",
        ],
      }
      config.cache = false
    }
    return config
  },
  env: {
    NEXT_PUBLIC_IS_VERCEL: isVercel ? "true" : "false",
    NEXT_PUBLIC_IS_TERMUX: isTermux ? "true" : "false",
  },
}

export default nextConfig
