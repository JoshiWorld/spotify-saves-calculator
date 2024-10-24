import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";

export const linkRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(3),
        pixelId: z.string(),
        accessToken: z.string(),
        testEventCode: z.string(),
        artist: z.string(),
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
      return ctx.db.link.create({
        data: {
          user: { connect: { id: ctx.session.user.id } },
          name: input.name.toLowerCase(),
          pixelId: input.pixelId,
          accessToken: input.accessToken,
          artist: input.artist,
          playbutton: input.playbutton,
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
      return ctx.db.link.delete({
        where: {
          id: input.id,
        },
      });
    }),

  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db.link.findMany({
        where: {
            user: { id: ctx.session.user.id }
        },
        orderBy: {
            createdAt: "desc",
        }
    });
  }),

  get: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const link = await ctx.db.link.findFirst({
        where: {
          id: input.id,
        },
      });

      return link ?? null;
    }),

  getByName: publicProcedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const link = await ctx.db.link.findFirst({
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
          swr: 60,
          ttl: 60,
        },
      });

      return link;
    }),
});
