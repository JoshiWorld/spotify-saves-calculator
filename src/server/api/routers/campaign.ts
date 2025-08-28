import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { subDays } from "date-fns";

export const campaignRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        name: z.string().min(3),
        metaCampaignId: z.string().min(3).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.campaign.create({
        data: {
          project: { connect: { id: input.projectId } },
          name: input.name,
          metaCampaignId: input.metaCampaignId,
        },
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
      return ctx.db.campaign.update({
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
        select: {
          name: true,
          id: true,
          project: {
            select: {
              id: true,
            }
          },
          metaCampaignId: true,
          posts: {
            select: {
              saves: true,
              budget: true,
              playlistAdds: true,
              date: true
            }
          },
        }
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
          name: campaign.name,
          id: campaign.id,
          projectId: campaign.project.id,
          metaCampaignId: campaign.metaCampaignId,
          totalBudget: Number(totalBudget),
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

  getCampaignName: protectedProcedure.input(z.object({ id: z.string() })).query(({ ctx, input }) => {
    return ctx.db.campaign.findUnique({
      where: {
        id: input.id
      },
      select: {
        name: true,
        project: {
          select: {
            name: true,
            id: true,
          }
        }
      }
    });
  }),

  getStatsCampaignView: protectedProcedure
      .input(z.object({ days: z.number(), projectId: z.string() }))
      .query(async ({ ctx, input }) => {
        const { days, projectId } = input;
        const endDate = new Date();
        const startDate = subDays(endDate, days);
        const startDateBefore = subDays(startDate, days);
  
        try {
          // Zeitraum A (aktuell)
          const posts = await ctx.db.project.findMany({
            where: {
              user: {
                id: ctx.session.user.id,
              },
              id: projectId
            },
            select: {
              campaigns: {
                select: {
                  posts: {
                    where: {
                      date: {
                        gte: startDate,
                        lte: endDate,
                      },
                    },
                    select: {
                      budget: true,
                      playlistAdds: true,
                      saves: true,
                    },
                  },
                },
              },
            },
          });
  
          // Zeitraum B (davor)
          const postsBefore = await ctx.db.project.findMany({
            where: {
              user: {
                id: ctx.session.user.id,
              },
              id: projectId
            },
            select: {
              campaigns: {
                select: {
                  posts: {
                    where: {
                      date: {
                        gte: startDateBefore,
                        lte: startDate,
                      },
                    },
                    select: {
                      budget: true,
                      playlistAdds: true,
                      saves: true,
                    },
                  },
                },
              },
            },
          });
  
          // Flatten Arrays
          const flatPosts = posts.flatMap((project) =>
            project.campaigns.flatMap((campaign) => campaign.posts)
          );
          const flatPostsBefore = postsBefore.flatMap((project) =>
            project.campaigns.flatMap((campaign) => campaign.posts)
          );
  
          function calculateStats(posts: { budget: number; saves: number; playlistAdds: number }[]) {
            const budget = posts.reduce((sum, p) => sum + (p.budget || 0), 0);
            const saves = posts.reduce((sum, p) => sum + (p.saves || 0), 0) + posts.reduce((sum, p) => sum + (p.playlistAdds || 0), 0);
            const cps = saves > 0 ? budget / saves : 0;
  
            return { budget, saves, cps };
          }
  
          // Stats berechnen
          const { budget, saves, cps } = calculateStats(flatPosts);
          const { budget: budgetBefore, saves: savesBefore, cps: cpsBefore } =
            calculateStats(flatPostsBefore);
  
          return {
            budget,
            saves,
            cps,
            budgetBefore,
            savesBefore,
            cpsBefore,
          };
        } catch (error) {
          console.error("Fehler bei Post-Stats:", error);
          return {
            budget: 0,
            saves: 0,
            cps: 0,
            budgetBefore: 0,
            savesBefore: 0,
            cpsBefore: 0,
          };
        }
      }),

  getStatsCampaignViewChart: protectedProcedure
      .input(z.object({ projectId: z.string() }))
      .query(async ({ ctx, input }) => {
        const endDate = new Date();
        const startDate = subDays(endDate, 90);
        const posts = await ctx.db.project.findMany({
          where: {
            user: {
              id: ctx.session.user.id,
            },
            id: input.projectId
          },
          select: {
            campaigns: {
              select: {
                posts: {
                  where: {
                    date: {
                      gte: startDate,
                      lte: endDate,
                    },
                  },
                  select: {
                    budget: true,
                    saves: true,
                    date: true,
                    playlistAdds: true,
                    endDate: true,
                  },
                },
              },
            },
          },
        });
  
        const flatPosts = posts.flatMap((project) =>
          project.campaigns.flatMap((campaign) => campaign.posts)
        );
  
        const dataMap = new Map<string, { budget: number; saves: number }>();
  
        for (const post of flatPosts) {
          const start = new Date(post.date);
          const end = post.endDate ? new Date(post.endDate) : start;
  
          // Alle Tage zwischen start und end durchgehen
          for (
            let d = new Date(start);
            d <= end;
            d.setDate(d.getDate() + 1)
          ) {
            const dateString = d.toISOString().split("T")[0]!;
  
            const existing = dataMap.get(dateString) ?? { budget: 0, saves: 0 };
            existing.budget += post.budget || 0;
            existing.saves += post.saves + post.playlistAdds || 0;
  
            dataMap.set(dateString, existing);
          }
        }
  
        const fullDateRange: { date: string; cps: number }[] = [];
  
        for (let i = 89; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateString = date.toISOString().split("T")[0]!;
  
          if (dataMap.has(dateString)) {
            const { budget, saves } = dataMap.get(dateString)!;
            const cps = saves > 0 ? budget / saves : 0;
            fullDateRange.push({ date: dateString, cps: Number(cps.toFixed(2)) });
          } else {
            fullDateRange.push({ date: dateString, cps: 0 });
          }
        }
  
        return fullDateRange;
      }),
});
