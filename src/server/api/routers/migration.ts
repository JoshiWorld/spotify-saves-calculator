import { env } from "@/env";
import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: env.KV_REST_API_URL,
  token: env.KV_REST_API_TOKEN,
});

export const migrationRouter = createTRPCRouter({
  migrateLinkStats: adminProcedure.mutation(async ({ ctx }) => {
    // Fetch old linkstats
    // const oldKeys = await redis.keys("stats:*:????-??-??"); // Alte Struktur "stats:linkid:date"
    const oldKeys = await redis.keys("stats:*"); // Alte Struktur "stats:linkid:date"
    
    for (const key of oldKeys) {
      const parts = key.split(":");
      const linkId = parts[1];
      const date = parts.length === 3 ? parts[2] : parts[3];
      console.log(parts);

      // Fetch data for key
      const stats = await redis.hgetall(key);

      if (!stats) throw Error("Could not fetch data from key in redis");

      // Fetch link for splittestversion
      const link = await ctx.db.link.findUnique({
        where: {
          id: linkId,
        },
        select: {
          splittestVersion: true,
        },
      });

      if (!link) throw Error(`Could not find link in db: ${linkId}`);

      // Save data to new format
      await redis.hset(
        `stats:${linkId}:${link.splittestVersion}:${date}`,
        stats,
      );

      // Delete old key
      await redis.del(key);
    }

    return {
      message: "Linkstats migrated",
    };
  }),
});
