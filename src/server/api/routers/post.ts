import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { subDays } from "date-fns";

type MetaCampaignInsights = {
  account_id: string;
  campaign_id: string;
  date_start: string;
  date_stop: string;
  impressions: string;
  spend: string;
};

type MetaCampaignInsightsRes = {
  data: MetaCampaignInsights[];
}

export const postRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        campaignId: z.string(),
        date: z.date(),
        endDate: z.date().nullable().optional(),
        budget: z.number().optional(),
        saves: z.number(),
        playlistAdds: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.budget) {
        return ctx.db.post.create({
          data: {
            campaign: { connect: { id: input.campaignId } },
            date: input.date,
            endDate: input.endDate,
            budget: input.budget,
            saves: input.saves,
            playlistAdds: input.playlistAdds,
          },
        });
      }
      const user = await ctx.db.user.findUnique({
        where: {
          id: ctx.session.user.id,
        },
        select: {
          metaAccessToken: true,
        }
      });
      const campaign = await ctx.db.campaign.findFirst({
        where: {
          id: input.campaignId,
        },
        select: {
          metaCampaignId: true,
        }
      });
      if (!user?.metaAccessToken || !campaign?.metaCampaignId) {
        throw new Error(`AccessToken or AccountID not found`);
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const accessToken = user.metaAccessToken;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const campaignId = campaign.metaCampaignId;

      // GET LAST 7 Days
      // const res = await fetch(
      //   `https://graph.facebook.com/v21.0/${campaignId}/insights?access_token=${accessToken}&date_preset=last_7d`,
      // );

      // GET TODAY
      // const today = input.date.toISOString().split("T")[0];
      const today = input.date.toLocaleDateString("en-CA");
      const end = input.endDate?.toLocaleDateString("en-CA");
      const res = await fetch(
        `https://graph.facebook.com/v21.0/${campaignId}/insights?access_token=${accessToken}&time_range[since]=${today}&time_range[until]=${end ?? today}`,
      );

      if (!res.ok) {
        throw new Error(`Failed to fetch campaigns token: ${res.statusText}`);
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const insights: MetaCampaignInsightsRes = await res.json();

      return ctx.db.post.create({
        data: {
          campaign: { connect: { id: input.campaignId } },
          date: input.date,
          endDate: input.endDate,
          budget: Number(insights.data[0]!.spend ?? 0),
          saves: input.saves,
          playlistAdds: input.playlistAdds,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        budget: z.number(),
        saves: z.number(),
        playlistAdds: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.post.update({
        where: {
          id: input.id,
        },
        data: {
          budget: input.budget,
          saves: input.saves,
          playlistAdds: input.playlistAdds,
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
      return ctx.db.post.delete({
        where: {
          id: input.id,
        },
      });
    }),

  getAll: protectedProcedure
    .input(
      z.object({
        campaignId: z.string(),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.db.post.findMany({
        where: {
          campaign: { id: input.campaignId },
        },
        orderBy: {
          date: "desc",
        },
        select: {
          id: true,
          budget: true,
          date: true,
          playlistAdds: true,
          saves: true,
          endDate: true,
        },
      });
    }),

  get: protectedProcedure
    .input(
      z.object({
        id: z.string(),
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

  getStatsPostsView: protectedProcedure
    .input(z.object({ days: z.number(), campaignId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { days, campaignId } = input;
      const endDate = new Date();
      const startDate = subDays(endDate, days);
      const startDateBefore = subDays(startDate, days);

      try {
        // Zeitraum A (aktuell)
        const posts = await ctx.db.post.findMany({
          where: {
            campaign: {
              id: campaignId
            },
            date: {
              gte: startDate,
              lte: endDate,
            }
          },
          select: {
            budget: true,
            playlistAdds: true,
            saves: true,
          },
        });

        // Zeitraum B (davor)
        const postsBefore = await ctx.db.post.findMany({
          where: {
            campaign: {
              id: campaignId
            },
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
        });

        function calculateStats(posts: { budget: number; saves: number; playlistAdds: number }[]) {
          const budget = posts.reduce((sum, p) => sum + (p.budget || 0), 0);
          const saves = posts.reduce((sum, p) => sum + (p.saves || 0), 0) + posts.reduce((sum, p) => sum + (p.playlistAdds || 0), 0);
          const cps = saves > 0 ? budget / saves : 0;

          return { budget, saves, cps };
        }

        // Stats berechnen
        const { budget, saves, cps } = calculateStats(posts);
        const { budget: budgetBefore, saves: savesBefore, cps: cpsBefore } =
          calculateStats(postsBefore);

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
  
  getStatsPostsViewAlltime: protectedProcedure
    .input(z.object({ campaignId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { campaignId } = input;

      try {
        const posts = await ctx.db.post.findMany({
          where: {
            campaign: {
              id: campaignId
            },
          },
          select: {
            budget: true,
            playlistAdds: true,
            saves: true,
          },
        });

        function calculateStats(posts: { budget: number; saves: number; playlistAdds: number }[]) {
          const budget = posts.reduce((sum, p) => sum + (p.budget || 0), 0);
          const saves = posts.reduce((sum, p) => sum + (p.saves || 0), 0) + posts.reduce((sum, p) => sum + (p.playlistAdds || 0), 0);
          const cps = saves > 0 ? budget / saves : 0;

          return { budget, saves, cps };
        }

        // Stats berechnen
        const { budget, saves, cps } = calculateStats(posts);

        return {
          budget,
          saves,
          cps,
        };
      } catch (error) {
        console.error("Fehler bei Post-Stats:", error);
        return {
          budget: 0,
          saves: 0,
          cps: 0,
        };
      }
    }),

  getStatsPostsViewChart: protectedProcedure
    .input(z.object({ campaignId: z.string() }))
    .query(async ({ ctx, input }) => {
      const endDate = new Date();
      const startDate = subDays(endDate, 90);
      const posts = await ctx.db.post.findMany({
        where: {
          campaign: {
            id: input.campaignId
          },
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
      });

      const dataMap = new Map<string, { budget: number; saves: number }>();

      for (const post of posts) {
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

  getStatsPostsViewChartAlltime: protectedProcedure
    .input(z.object({ campaignId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Alle Posts holen (ohne Zeitfilter)
      const posts = await ctx.db.post.findMany({
        where: {
          campaign: {
            id: input.campaignId,
          },
        },
        select: {
          budget: true,
          saves: true,
          playlistAdds: true,
          date: true,
          endDate: true,
        },
        orderBy: {
          date: "asc", // wichtig, damit wir min/max finden können
        },
      });

      if (posts.length === 0) {
        return [];
      }

      // Start = erstes Post-Datum, End = letztes Post-Ende oder letztes Post-Datum
      // @ts-expect-error || cannot throw error
      const startDate = new Date(posts[0].date);
      const lastPost = posts[posts.length - 1];
      // @ts-expect-error || cannot throw error
      const endDate = lastPost.endDate ? new Date(lastPost.endDate) : new Date(lastPost.date);

      const dataMap = new Map<string, { budget: number; saves: number }>();

      for (const post of posts) {
        const start = new Date(post.date);
        const end = post.endDate ? new Date(post.endDate) : start;

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dateString = d.toISOString().split("T")[0]!;

          const existing = dataMap.get(dateString) ?? { budget: 0, saves: 0 };
          existing.budget += post.budget || 0;
          existing.saves += (post.saves || 0) + (post.playlistAdds || 0);

          dataMap.set(dateString, existing);
        }
      }

      const fullDateRange: { date: string; cps: number }[] = [];

      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateString = d.toISOString().split("T")[0]!;

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
