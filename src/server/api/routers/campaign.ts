import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const campaignRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        projectId: z.string(),
        name: z.string().min(3),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.campaign.create({
        data: {
          project: { connect: { id: input.projectId } },
          name: input.name,
        },
      });
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        projectId: z.string(),
        name: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.campaign.update({
        where: {
          id: input.id,
        },
        data: {
          project: { connect: { id: input.projectId } },
          name: input.name,
        },
      });
    }),

  delete: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.campaign.delete({
        where: {
          id: input.id,
        },
      });
    }),

  getAll: publicProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.campaign.findMany({
        where: {
          project: { id: input.projectId },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }),

  get: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const campaign = await ctx.db.campaign.findFirst({
        where: {
          id: input.id,
        },
      });

      return campaign ?? null;
    }),

  getByName: publicProcedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const campaign = await ctx.db.campaign.findFirst({
        where: {
          name: input.name,
        },
      });

      return campaign ?? null;
    }),
});
