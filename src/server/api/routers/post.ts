import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

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
        // budget: z.number(),
        saves: z.number(),
        playlistAdds: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: {
          id: ctx.session.user.id,
        },
      });
      const campaign = await ctx.db.campaign.findFirst({
        where: {
          id: input.campaignId,
        },
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
      const today = input.date.toISOString().split("T")[0];
      const res = await fetch(
        `https://graph.facebook.com/v21.0/${campaignId}/insights?access_token=${accessToken}&time_range[since]=${today}&time_range[until]=${today}`,
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
        campaignId: z.string(),
        date: z.date(),
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
          campaign: { connect: { id: input.campaignId } },
          date: input.date,
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
});
