import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
// import { withOptimize } from "@prisma/extension-optimize";

import { env } from "@/env";

const createPrismaClient = () =>
  new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error", "query", "info", "warn"],
      // env.NODE_ENV === "development" ? ["error"] : ["error"],
  })
    // .$extends(withOptimize({ apiKey: env.OPTIMIZE_API_KEY }))
    .$extends(withAccelerate());

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;
