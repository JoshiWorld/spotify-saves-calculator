import { z } from "zod";

import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";

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

  get: adminProcedure
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
      });
    }),

  getByName: adminProcedure
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
      });
    }),
});
