import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const campaignRouter = createTRPCRouter({
  create: protectedProcedure
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

  update: protectedProcedure
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

  delete: protectedProcedure
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

  getAll: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const campaigns = await ctx.db.campaign.findMany({
        where: {
          project: { id: input.projectId },
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          posts: true,
        },
      });

      const campaignsWithBudgetAndDuration = campaigns.map((campaign) => {
        const totalBudget = campaign.posts
          .reduce((postAcc, post) => postAcc + post.budget, 0)
          .toFixed(2);
        const totalPostSaves = campaign.posts.reduce(
          (postAcc, post) => postAcc + post.saves,
          0,
        );
        const totalPostAdds = campaign.posts.reduce(
          (postAcc, post) => postAcc + post.playlistAdds,
          0,
        );
        const totalSaves = totalPostSaves + totalPostAdds;

        const allPostDates = campaign.posts.map((post) => new Date(post.date));

        let totalDays = 0;
        if (allPostDates.length > 0) {
          const oldestDate = new Date(
            Math.min(...allPostDates.map((d) => d.getTime())),
          );
          const newestDate = new Date(
            Math.max(...allPostDates.map((d) => d.getTime())),
          );
          const diffTime = Math.abs(
            newestDate.getTime() - oldestDate.getTime(),
          );
          totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }

        return {
          ...campaign,
          totalBudget,
          totalDays,
          totalSaves,
        };
      });

      return campaignsWithBudgetAndDuration;
    }),

  get: protectedProcedure
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

  getByName: protectedProcedure
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
