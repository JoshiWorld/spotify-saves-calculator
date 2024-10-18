import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const projectRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(3),
        metaAccountId: z.string().min(3),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.project.create({
        data: {
          user: { connect: { id: ctx.session.user.id } },
          name: input.name,
          metaAccount: { connect: { id: input.metaAccountId } },
        },
        include: {
          metaAccount: true
        }
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.project.update({
        where: {
          id: input.id,
        },
        data: {
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
      return ctx.db.project.delete({
        where: {
          id: input.id,
        },
      });
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    const projects = await ctx.db.project.findMany({
      where: {
        user: { id: ctx.session.user.id }
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        campaigns: {
          include: {
            posts: true,
          },
        },
      },
    });

    const projectsWithBudgetAndDuration = projects.map((project) => {
      const totalBudget = project.campaigns
        .reduce((campaignAcc, campaign) => {
          const campaignBudget = campaign.posts.reduce(
            (postAcc, post) => postAcc + post.budget,
            0,
          );
          return campaignAcc + campaignBudget;
        }, 0)
        .toFixed(2);

      const totalSaves = project.campaigns.reduce((campaignAcc, campaign) => {
        const campaignSaves = campaign.posts.reduce(
          (postAcc, post) => postAcc + post.saves,
          0,
        );
        const campaignPlaylistAdds = campaign.posts.reduce(
          (postAcc, post) => postAcc + post.playlistAdds,
          0,
        );
        return campaignAcc + campaignSaves + campaignPlaylistAdds;
      }, 0);

      const allPostDates = project.campaigns
        .flatMap((campaign) => campaign.posts)
        .map((post) => new Date(post.date));

      let totalDays = 0;
      if (allPostDates.length > 0) {
        const oldestDate = new Date(
          Math.min(...allPostDates.map((d) => d.getTime())),
        );
        const newestDate = new Date(
          Math.max(...allPostDates.map((d) => d.getTime())),
        );
        const diffTime = Math.abs(newestDate.getTime() - oldestDate.getTime());
        totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }

      return {
        ...project,
        totalBudget,
        totalDays,
        totalSaves,
        campaigns: project.campaigns.map((campaign) => ({
          ...campaign,
          posts: campaign.posts,
        })),
      };
    });

    return projectsWithBudgetAndDuration;
  }),

  get: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const project = await ctx.db.project.findFirst({
        where: {
          id: input.id,
        },
      });

      return project ?? null;
    }),

  getByName: protectedProcedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const project = await ctx.db.project.findFirst({
        where: {
          user: { id: ctx.session.user.id },
          name: input.name,
        },
      });

      return project ?? null;
    }),
});
