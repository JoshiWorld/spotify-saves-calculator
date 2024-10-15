import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const postRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        campaignId: z.string(),
        date: z.date(),
        budget: z.number(),
        saves: z.number(),
        playlistAdds: z.number()
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.post.create({
        data: {
          campaign: { connect: { id: input.campaignId } },
          date: input.date,
          budget: input.budget,
          saves: input.saves,
          playlistAdds: input.playlistAdds,
        },
      });
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        campaignId: z.string(),
        date: z.date(),
        budget: z.number(),
        saves: z.number(),
        playlistAdds: z.number()
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.post.update({
        where: {
          id: input.id
        },
        data: {
          campaign: { connect: { id: input.campaignId } },
          date: input.date,
          budget: input.budget,
          saves: input.saves,
          playlistAdds: input.playlistAdds,
        },
      });
    }),

  delete: publicProcedure
    .input(
      z.object({
        id: z.string()
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.post.delete({
        where: {
          id: input.id,
        },
      });
    }),

  getAll: publicProcedure
    .input(
      z.object({
        campaignId: z.string()
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.post.findMany({
        where: {
          campaign: { id: input.campaignId },
        },
        orderBy: {
          date: "desc",
        },
      });
    }),

  get: publicProcedure
    .input(
      z.object({
        id: z.string()
      }),
    )
    .query(async ({ ctx, input }) => {
      const post = await ctx.db.post.findFirst({
        where: {
          id: input.id,
        },
      });

      return post ?? null;
    }),
});
