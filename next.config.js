/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
  images: {
    minimumCacheTTL: 2592000,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hypeddit-gates-prod.s3.amazonaws.com'
      },
      {
        protocol: 'https',
        hostname: 'hypeddit.com'
      }
    ]  
  },
};

export default config;
