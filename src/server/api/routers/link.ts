import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import {
  S3Client,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { env } from "@/env";
import { Package } from "@prisma/client";

const s3 = new S3Client({
  region: env.S3_REGION,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
  },
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
        // image: z.custom<File>(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: {
          id: ctx.session.user.id
        },
        select: {
          package: true,
          admin: true,
        }
      });

      const linkCount = await ctx.db.link.count({
        where: {
          user: {
            id: ctx.session.user.id,
          },
        },
      });

      if(
        (!user?.admin && user?.package === Package.STARTER && linkCount >= 10) ||
        (!user?.admin && user?.package === Package.ARTIST && linkCount >= 50)
      ) {
        return null;
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
        image: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.link.update({
        where: {
          id: input.id,
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
          id: input.id
        }
      });

      if(link?.image) {
        const imageKey = extractKeyFromUrl(link.image);
        const deleteParams = {
          Bucket: env.S3_BUCKET_NAME,
          Key: imageKey
        };
        // @ts-expect-error || always true
        const deleteCommand = new DeleteObjectCommand(deleteParams);
        await s3.send(deleteCommand);
      }

      return ctx.db.link.delete({
        where: {
          id: input.id,
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
      }
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
            id: ctx.session.user.id
          }
        }
      });
    }),
  
  getLinkName: protectedProcedure.input(z.object({
    id: z.string()
  })).query(({ ctx, input }) => {
    return ctx.db.link.findUnique({
      where: {
        id: input.id,
        user: {
          id: ctx.session.user.id
        }
      },
      select: {
        songtitle: true
      }
    });
  }),

  getByName: publicProcedure
    .input(
      z.object({
        name: z.string(),
        artist: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.link.findFirst({
        where: {
          name: input.name,
        },
        select: {
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
        },
        cacheStrategy: {
          swr: 30,
          ttl: 30,
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