import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { env } from "@/env";

type AccountId = {
    account_status: number;
    id: string;
    name: string;
};

type AccountIdRes = {
    data: AccountId[]
}

type MetaCampaign = {
  id: string;
  name: string;
  objective: string;
  status: string;
};

type MetaCampaignRes = {
  data: MetaCampaign[]
};

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
};

export const metaRouter = createTRPCRouter({
  setAccessToken: protectedProcedure
    .input(
      z.object({
        code: z.string().min(4),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const redirect_uri = "http://localhost:3000/meta/callback";

      const tokenResponse = await fetch(
        `https://graph.facebook.com/v21.0/oauth/access_token?client_id=${env.META_APP_ID}&redirect_uri=${redirect_uri}&client_secret=${env.META_APP_SECRET}&code=${input.code}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          next: { revalidate: 0 },
        },
      );

      if (!tokenResponse.ok) {
        throw new Error(
          `Failed to fetch access token: ${tokenResponse.statusText}`,
        );
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const tokenData = await tokenResponse.json();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const accessToken = tokenData.access_token;

      const longLivedAccessTokenRes = await fetch(
        `https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${env.META_APP_ID}&client_secret=${env.META_APP_SECRET}&fb_exchange_token=${accessToken}`,
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const longLivedAccessTokenData = await longLivedAccessTokenRes.json();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const longLivedToken = longLivedAccessTokenData.access_token;

      // Fetch Account IDs
      const accountIdsRes = await fetch(
        `https://graph.facebook.com/v21.0/me/adaccounts?fields=id,name,account_status&access_token=${longLivedToken}`,
      );

      if (!accountIdsRes.ok) {
        throw new Error(
          `Failed to fetch adaccountid token: ${accountIdsRes.statusText}`,
        );
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const adAccountsData: AccountIdRes = await accountIdsRes.json();
      
      const accountDataToInsert = adAccountsData.data.map((acc) => ({
        accountId: acc.id,
        name: acc.name,
        account_status: acc.account_status,
        userId: ctx.session.user.id,
      }));

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await ctx.db.metaAccount.createMany({
        data: accountDataToInsert
      });

      return ctx.db.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          metaAccessToken: longLivedToken,
        },
      });
    }),

  getMetaAccounts: protectedProcedure.query(({ ctx }) => {
    return ctx.db.metaAccount.findMany({
      where: {
        user: { id: ctx.session.user.id }
      }
    });
  }),

  getCampaigns: protectedProcedure.input(z.object({
    projectId: z.string()
  })).query(async ({ ctx, input }) => {
    const user = await ctx.db.user.findUnique({
      where: {
        id: ctx.session.user.id,
      },
    });
    const project = await ctx.db.project.findFirst({
      where: {
        id: input.projectId
      },
      include: {
        metaAccount: true
      }
    });
    if(!user?.metaAccessToken || !project?.metaAccount) {
        throw new Error(
          `AccessToken or AccountID not found`,
        );
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const accessToken = user.metaAccessToken;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const adAccountId = project.metaAccount.accountId;

    const res = await fetch(
      `https://graph.facebook.com/v21.0/${adAccountId}/campaigns?fields=id,name,status,objective&access_token=${accessToken}`,
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch campaigns token: ${res.statusText}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const campaigns: MetaCampaignRes = await res.json();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return campaigns.data;
  }),

  getCampaignInsights: protectedProcedure.input(z.object({
    campaignId: z.string(),
  })).query(async ({ ctx, input }) => {
    const user = await ctx.db.user.findUnique({
      where: {
        id: ctx.session.user.id,
      },
    });
    const campaign = await ctx.db.campaign.findFirst({
      where: {
        id: input.campaignId
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
    const today = new Date().toISOString().split("T")[0];
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${campaignId}/insights?access_token=${accessToken}&time_range[since]=${today}&time_range[until]=${today}`,
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch campaigns token: ${res.statusText}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const insights: MetaCampaignInsightsRes = await res.json();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return insights.data;
  })
});
