import { z } from "zod";

import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { env } from "@/env";
import { Package, SplittestVersion } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { Redis } from "@upstash/redis";

type UserLinkCached = {
  id: string;
  description: string | null;
  name: string;
  artist: string;
  songtitle: string;
  spotifyUri: string | null;
  appleUri: string | null;
  deezerUri: string | null;
  itunesUri: string | null;
  napsterUri: string | null;
  image: string | null;
  testEventCode: string | null;
  pixelId: string;
  playbutton: boolean;
  glow: boolean;
  testMode: boolean;
  splittest: boolean;
  spotifyGlowColor: string | null;
  appleMusicGlowColor: string | null;
  itunesGlowColor: string | null;
  deezerGlowColor: string | null;
  splittestVersion: SplittestVersion | null;
};

const s3 = new S3Client({
  region: env.S3_REGION,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
  },
});

const redis = new Redis({
  url: env.KV_REST_API_URL,
  token: env.KV_REST_API_TOKEN,
});

export const linkRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(3),
        pixelId: z.string(),
        accessToken: z.string(),
        testEventCode: z.string(),
        artist: z.string(),
        genre: z.string().nullable(),
        playbutton: z.boolean(),
        songtitle: z.string(),
        description: z.string().optional(),
        spotifyUri: z.string().optional(),
        appleUri: z.string().optional(),
        deezerUri: z.string().optional(),
        itunesUri: z.string().optional(),
        napsterUri: z.string().optional(),
        image: z.string().optional(),
        glow: z.boolean(),
        splittest: z.boolean(),
        spotifyGlowColor: z.string(),
        appleMusicGlowColor: z.string(),
        itunesGlowColor: z.string(),
        deezerGlowColor: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: {
          id: ctx.session.user.id,
        },
        select: {
          package: true,
          admin: true,
        },
      });

      if (!user?.package) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Du hast keinen Zugriff auf diese Funktion",
        });
      }

      if (!user.admin && user.package === Package.STARTER) {
        const linkCount = await ctx.db.link.count({
          where: {
            user: {
              id: ctx.session.user.id,
            },
          },
        });

        if (linkCount >= 5) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Maximum des Pakets wurde erreicht",
          });
        }
      }

      const existingLink = await ctx.db.link.findFirst({
        where: {
          name: input.name
        },
        select: {
          id: true,
        }
      });

      if(existingLink) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `Ein Link mit der URL existiert bereits. (${input.name})`,
        });
      }

      return ctx.db.link.create({
        data: {
          user: { connect: { id: ctx.session.user.id } },
          name: input.name.toLowerCase(),
          pixelId: input.pixelId,
          accessToken: input.accessToken,
          artist: input.artist,
          playbutton: input.playbutton,
          genre: input.genre ? { connect: { id: input.genre } } : undefined,
          songtitle: input.songtitle,
          description: input.description,
          spotifyUri: input.spotifyUri,
          appleUri: input.appleUri,
          deezerUri: input.deezerUri,
          itunesUri: input.itunesUri,
          testEventCode: input.testEventCode,
          napsterUri: input.napsterUri,
          image: input.image,
          glow: input.glow,
          splittest: input.splittest,
          spotifyGlowColor: input.spotifyGlowColor,
          appleMusicGlowColor: input.appleMusicGlowColor,
          itunesGlowColor: input.itunesGlowColor,
          deezerGlowColor: input.deezerGlowColor,
          splittestVersion: input.glow
            ? SplittestVersion.GLOW
            : SplittestVersion.DEFAULT,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(3),
        pixelId: z.string(),
        accessToken: z.string(),
        testEventCode: z.string(),
        artist: z.string(),
        genre: z.string().nullable(),
        playbutton: z.boolean(),
        songtitle: z.string(),
        description: z.string().optional(),
        spotifyUri: z.string().optional(),
        appleUri: z.string().optional(),
        deezerUri: z.string().optional(),
        itunesUri: z.string().optional(),
        napsterUri: z.string().optional(),
        image: z.string().optional().nullable(),
        glow: z.boolean(),
        enabled: z.boolean(),
        testMode: z.boolean(),
        splittest: z.boolean(),
        spotifyGlowColor: z.string(),
        appleMusicGlowColor: z.string(),
        itunesGlowColor: z.string(),
        deezerGlowColor: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const oldLink = await ctx.db.link.findUnique({
        where: {
          id: input.id,
        },
        select: {
          name: true,
        },
      });

      const updatedLink = await ctx.db.link.update({
        where: {
          id: input.id,
          user: {
            id: ctx.session.user.id,
          },
        },
        data: {
          name: input.name.toLowerCase(),
          pixelId: input.pixelId,
          accessToken: input.accessToken,
          artist: input.artist,
          songtitle: input.songtitle,
          playbutton: input.playbutton,
          description: input.description,
          spotifyUri: input.spotifyUri,
          appleUri: input.appleUri,
          genre: input.genre ? { connect: { id: input.genre } } : undefined,
          testEventCode: input.testEventCode,
          deezerUri: input.deezerUri,
          itunesUri: input.itunesUri,
          napsterUri: input.napsterUri,
          image: input.image,
          glow: input.glow,
          enabled: input.enabled,
          testMode: input.testMode,
          splittest: input.splittest,
          spotifyGlowColor: input.spotifyGlowColor,
          appleMusicGlowColor: input.appleMusicGlowColor,
          itunesGlowColor: input.itunesGlowColor,
          deezerGlowColor: input.deezerGlowColor,
          splittestVersion: input.glow
            ? SplittestVersion.GLOW
            : SplittestVersion.DEFAULT,
        },
        select: {
          id: true,
          name: true,
          artist: true,
        },
      });

      const cacheKey = oldLink
        ? `link:${oldLink.name}`
        : `link:${updatedLink.name}`;
      await redis.del(cacheKey);

      // revalidatePath(
      //   `/link/${updatedLink.artist.toLowerCase().replace(/\s+/g, "")}/${updatedLink.name}`,
      // );

      // await ctx.db.$accelerate.invalidate({
      //   tags: [`${updatedLink.name.replaceAll("-", "_")}`],
      // });

      return updatedLink;
    }),

  updateNextSplittest: publicProcedure
    .input(
      z.object({
        id: z.string(),
        splittestVersion: z.nativeEnum(SplittestVersion),
        name: z.string(),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.db.link.update({
        where: {
          id: input.id,
        },
        data: {
          splittestVersion: input.splittestVersion,
        },
      });
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const link = await ctx.db.link.findUnique({
        where: {
          id: input.id,
          user: {
            id: ctx.session.user.id,
          },
        },
        select: {
          image: true,
          name: true,
        },
      });

      if (!link) throw Error("Link not found");

      if (link.image) {
        const imageKey = extractKeyFromUrl(link.image);
        const deleteParams = {
          Bucket: env.S3_BUCKET_NAME,
          Key: imageKey,
        };
        // @ts-expect-error || always true
        const deleteCommand = new DeleteObjectCommand(deleteParams);
        await s3.send(deleteCommand);
      }

      // Deleting stats
      const statsKeys = await redis.keys(`stats:${input.id}:*`);
      for (const key of statsKeys) {
        await redis.del(key);
      }

      const cacheKey = `link:${link.name}`;
      await redis.del(cacheKey);

      return ctx.db.link.delete({
        where: {
          id: input.id,
          user: {
            id: ctx.session.user.id,
          },
        },
      });
    }),

  getAllView: protectedProcedure.query(({ ctx }) => {
    return ctx.db.link.findMany({
      where: {
        user: { id: ctx.session.user.id },
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        songtitle: true,
        pixelId: true,
        artist: true,
        testMode: true,
        splittest: true,
        enabled: true,
      },
    });
  }),

  get: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.db.link.findUnique({
        where: {
          id: input.id,
          user: {
            id: ctx.session.user.id,
          },
        },
      });
    }),

  getLinkName: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.db.link.findUnique({
        where: {
          id: input.id,
          user: {
            id: ctx.session.user.id,
          },
        },
        select: {
          songtitle: true,
        },
      });
    }),

  getSplittest: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const link = await ctx.db.link.findUnique({
        where: {
          id: input.id,
          user: {
            id: ctx.session.user.id,
          },
        },
        select: {
          splittest: true,
        },
      });

      return link?.splittest;
    }),

  getByName: publicProcedure
    .input(
      z.object({
        name: z.string(),
        artist: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const linkData = await getLinkDataFromCache(input.name);
      if (linkData) {
        if (linkData.splittest) {
          return ctx.db.link.findFirst({
            where: {
              name: input.name,
            },
            select: {
              id: true,
              description: true,
              name: true,
              artist: true,
              songtitle: true,
              spotifyUri: true,
              appleUri: true,
              deezerUri: true,
              itunesUri: true,
              napsterUri: true,
              image: true,
              testEventCode: true,
              pixelId: true,
              playbutton: true,
              glow: true,
              testMode: true,
              splittest: true,
              spotifyGlowColor: true,
              appleMusicGlowColor: true,
              itunesGlowColor: true,
              deezerGlowColor: true,
              splittestVersion: true,
            },
          });
        }

        return linkData;
      }

      const link = await ctx.db.link.findFirst({
        where: {
          name: input.name,
        },
        select: {
          id: true,
          description: true,
          name: true,
          artist: true,
          songtitle: true,
          spotifyUri: true,
          appleUri: true,
          deezerUri: true,
          itunesUri: true,
          napsterUri: true,
          image: true,
          testEventCode: true,
          pixelId: true,
          playbutton: true,
          glow: true,
          testMode: true,
          splittest: true,
          spotifyGlowColor: true,
          appleMusicGlowColor: true,
          itunesGlowColor: true,
          deezerGlowColor: true,
          splittestVersion: true,
        },
        // cacheStrategy: {
        //   ttl: 60 * 60,
        //   tags: [`${input.name.replaceAll('-', '_')}`]
        // },
      });

      if (!link) {
        throw new TRPCError({
          code: "BAD_REQUEST",
        });
      }

      await setLinkDataInCache(link.name, link);

      return link;
    }),
  getTitles: publicProcedure
    .input(
      z.object({
        name: z.string(),
        artist: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const linkData = await getLinkDataFromCache(input.name);
      if (linkData)
        return {
          description: linkData.description,
          artist: linkData.artist,
          songtitle: linkData.songtitle,
        };

      return ctx.db.link.findFirst({
        where: {
          name: input.name,
        },
        select: {
          description: true,
          artist: true,
          songtitle: true,
        },
        // cacheStrategy: {
        //   swr: 30,
        //   ttl: 30,
        // },
      });
    }),

  // ADMIN STUFF
  getAllLinks: adminProcedure.query(({ ctx }) => {
    return ctx.db.link.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        songtitle: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        artist: true,
        genre: true,
      },
    });
  }),
});

function extractKeyFromUrl(url: string) {
  const urlPattern = new RegExp(
    // `https://${env.S3_BUCKET_NAME}.s3.${env.S3_REGION}.amazonaws.com/(.*)`,
    `https://${env.CLOUDFRONT_KEY}.cloudfront.net/(.*)`,
  );
  const match = url.match(urlPattern);

  console.log("MATCH FOUND:", match);

  return match ? match[1] : null;
}

async function getLinkDataFromCache(slug: string) {
  const cacheKey = `link:${slug}`;
  const cachedData: UserLinkCached | null = await redis.get(cacheKey);

  if (cachedData) {
    return cachedData;
  }

  return null;
}

async function setLinkDataInCache(slug: string, data: UserLinkCached) {
  const cacheKey = `link:${slug}`;
  await redis.set(cacheKey, JSON.stringify(data), { ex: 60 * 60 * 24 });
}