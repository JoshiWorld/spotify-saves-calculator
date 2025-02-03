import { z } from "zod";

import { adminProcedure, createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const genreRouter = createTRPCRouter({
  create: adminProcedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.genre.create({
        data: {
          name: input.name,
        },
      });
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.genre.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
        },
      });
    }),

  delete: adminProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.genre.delete({
        where: {
          id: input.id,
        },
      });
    }),

  get: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.db.genre.findUnique({
        where: {
          id: input.id,
        },
        select: {
          name: true,
          id: true,
        },
        cacheStrategy: {
          swr: 60,
          ttl: 60,
        },
      });
    }),

  getByName: publicProcedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.db.genre.findFirst({
        where: {
          name: input.name,
        },
        select: {
          name: true,
          id: true,
        },
        cacheStrategy: {
          swr: 60,
          ttl: 60,
        },
      });
    }),

  getAll: publicProcedure
    .query(({ ctx }) => {
      return ctx.db.genre.findMany({
        select: {
          name: true,
          id: true,
        },
        cacheStrategy: {
          swr: 60,
          ttl: 60,
        },
      });
    }),
});
