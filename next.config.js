/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
  images: {
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hypeddit-gates-prod.s3.amazonaws.com'
      },
      {
        protocol: 'https',
        hostname: 'hypeddit.com'
      },
      {
        protocol: 'https',
        hostname: 'ssc.s3.eu-central-1.amazonaws.com'
      }
    ]  
  },
};

export default config;
