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
        endDate: z.date().nullable().optional(),
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

      // console.log(insights);

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
        page: z.number().optional().default(1),
        pageSize: z.number().optional().default(14),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { campaignId, page, pageSize } = input;
      const skip = (page - 1) * pageSize;

      const posts = await ctx.db.post.findMany({
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
        take: pageSize,
        skip,
      });

      const totalPosts = await ctx.db.post.count({
        where: {
          campaign: {
            id: campaignId
          }
        }
      });

      const totalPages = Math.ceil(totalPosts / pageSize);

      return {
        posts,
        page,
        pageSize,
        totalPosts,
        totalPages
      }
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
