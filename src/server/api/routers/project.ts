import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { subDays } from "date-fns";

export const projectRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(3),
        metaAccountId: z.string().min(3).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.metaAccountId) {
        return ctx.db.project.create({
          data: {
            user: { connect: { id: ctx.session.user.id } },
            name: input.name,
            metaAccount: { connect: { id: input.metaAccountId } },
          },
          include: {
            metaAccount: true,
          },
        });
      }

      return ctx.db.project.create({
        data: {
          user: { connect: { id: ctx.session.user.id } },
          name: input.name,
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
      select: {
        name: true,
        id: true,
        metaAccountId: true,
        campaigns: {
          select: {
            posts: {
              select: {
                budget: true,
                saves: true,
                playlistAdds: true,
                date: true,
              }
            }
          }
        },
      }
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
        // ...project,
        id: project.id,
        name: project.name,
        totalBudget: Number(totalBudget),
        totalDays,
        totalSaves,
        // campaigns: project.campaigns.map((campaign) => ({
        //   ...campaign,
        //   posts: campaign.posts,
        // })),
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



  getStatsProjectView: protectedProcedure
    .input(z.object({ days: z.number() }))
    .query(async ({ ctx, input }) => {
      const { days } = input;
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

  getStatsProjectViewChart: protectedProcedure
    .query(async ({ ctx }) => {
      const endDate = new Date();
      const startDate = subDays(endDate, 90);
      const posts = await ctx.db.project.findMany({
        where: {
          user: {
            id: ctx.session.user.id,
          },
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

  getProjectName: protectedProcedure.input(z.object({ id: z.string() })).query(({ ctx, input }) => {
    return ctx.db.project.findUnique({
      where: {
        id: input.id
      },
      select: {
        name: true,
      }
    });
  }),
});
