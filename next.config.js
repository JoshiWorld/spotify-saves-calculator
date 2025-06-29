/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");
import { withAxiom } from "next-axiom";

/** @type {import("next").NextConfig} */
const config = {
  experimental: {
    viewTransition: true,
  },
  images: {
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "spotifysavescalculator.s3.eu-central-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "assets.aceternity.com",
      },
      {
        protocol: "https",
        hostname: "www.facebook.com",
      },
      {
        protocol: "https",
        hostname: "d1dbkf4e4jii4v.cloudfront.net",
      },
      {
        protocol: "https",
        hostname: "uploadthing.com",
      },
      {
        protocol: "https",
        hostname: "wqtuj5hvv1.ufs.sh",
      },
      {
        protocol: "https",
        hostname: "i.scdn.co",
      },
    ],
  },
  // async headers() {
  //   return [
  //     {
  //       source: "/:path*",
  //       headers: [
  //         {
  //           key: "Content-Security-Policy",
  //           value:
  //             "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://us-assets.i.posthog.com https://app.cal.com https://va.vercel-scripts.com",
  //         },
  //       ],
  //     },
  //   ];
  // },

  // async headers() {
  //   return [
  //     {
  //       source: '/_next/static/(.*)',
  //       headers: [
  //         {
  //           key: 'Cache-Control',
  //           value: 'public, max-age=31536000, immutable',
  //         },
  //       ],
  //     },
  //     {
  //       source: '/images/(.*)',
  //       headers: [
  //         {
  //           key: 'Cache-Control',
  //           value: 'public, max-age=31536000, immutable',
  //         },
  //       ],
  //     },
  //     {
  //       source: '/api/(.*)',
  //       headers: [
  //         {
  //           key: 'Cache-Control',
  //           value: 'public, max-age=60, stale-while-revalidate=3600',
  //         },
  //       ],
  //     },
  //   ];
  // },
};

export default withAxiom(config);
