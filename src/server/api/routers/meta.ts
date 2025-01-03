import { z } from "zod";
// import crypto from "crypto";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { env } from "@/env";

type AccountId = {
  account_status: number;
  id: string;
  name: string;
};

type AccountIdRes = {
  data: AccountId[];
};

type MetaCampaign = {
  id: string;
  name: string;
  objective: string;
  status: string;
};

type MetaCampaignRes = {
  data: MetaCampaign[];
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

// function hashData(data: string): string {
//   return crypto
//     .createHash("sha256")
//     .update(data.trim().toLowerCase())
//     .digest("hex");
// }

export const metaRouter = createTRPCRouter({
  setAccessToken: protectedProcedure
    .input(
      z.object({
        code: z.string().min(4),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const redirect_uri = `${env.NEXTAUTH_URL}/meta/callback`;

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

      // Finde alle existierenden Accounts, um Duplikate zu vermeiden
      const existingAccounts = await ctx.db.metaAccount.findMany({
        where: {
          userId: ctx.session.user.id,
          accountId: {
            in: accountDataToInsert.map((acc) => acc.accountId),
          },
        },
        select: {
          accountId: true,
        },
      });

      // Erstelle eine Liste von accountIds, die bereits in der Datenbank vorhanden sind
      const existingAccountIds = new Set(
        existingAccounts.map((acc) => acc.accountId),
      );

      // Filtere die Daten, um nur neue Accounts hinzuzufügen, die nicht bereits existieren
      const newAccounts = accountDataToInsert.filter(
        (acc) => !existingAccountIds.has(acc.accountId),
      );

      // Füge nur die neuen Accounts hinzu
      if (newAccounts.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        await ctx.db.metaAccount.createMany({
          data: newAccounts,
        });
      }

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
    // const accountIdsMeta = await fetch(
    //   `https://graph.facebook.com/v21.0/${adAccountsData.data[1]?.id}/ads?access_token=${longLivedToken}`,
    // );
    // console.log(accountIdsMeta);

    return ctx.db.metaAccount.findMany({
      where: {
        user: { id: ctx.session.user.id },
      },
    });
  }),

  getCampaigns: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: {
          id: ctx.session.user.id,
        },
      });
      const project = await ctx.db.project.findFirst({
        where: {
          id: input.projectId,
        },
        include: {
          metaAccount: true,
        },
      });
      if (!user?.metaAccessToken || !project?.metaAccount) {
        throw new Error(`AccessToken or AccountID not found`);
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

  getCampaignInsights: protectedProcedure
    .input(
      z.object({
        campaignId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
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
    }),

  conversionEvent: publicProcedure
    .input(
      z.object({
        linkName: z.string(),
        eventName: z.string(),
        event_time: z.number().nullable(),
        testEventCode: z.string().nullable(),
        eventId: z.string(),
        eventData: z.object({
          content_category: z.string().optional(),
          content_name: z.string().optional(),
        }),
        customerInfo: z.object({
          client_user_agent: z.string(),
          client_ip_address: z.string(),
          fbc: z.string().nullable(),
          fbp: z.string().nullable(),
          email: z.string().optional(),
          phone: z.string().optional(),
          firstName: z.string().optional(),
          lastName: z.string().optional(),
          city: z.string().optional(),
          zip: z.string().optional(),
          country: z.string().optional(),
        }),
        referer: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const link = await ctx.db.link.findFirst({
        where: {
          name: input.linkName,
        },
        select: {
          id: true,
          accessToken: true,
          pixelId: true,
        },
      });
      if (!link) throw new Error(`Failed to fetch link`);

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const linkTracking = await ctx.db.linkTracking.findFirst({
        where: {
          link: { id: link.id },
          event: input.eventId.toLowerCase().includes('visit') ? 'visit' : 'click',
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        select: {
          id: true,
        },
      });

      if (!linkTracking) {
        await ctx.db.linkTracking.create({
          data: {
            link: { connect: { id: link.id } },
            actions: 1,
            event: input.eventId.toLowerCase().includes("visit") ? "visit" : "click",
          },
        });
      } else {
        await ctx.db.linkTracking.update({
          where: {
            id: linkTracking.id,
          },
          data: {
            actions: {
              increment: 1,
            },
          },
        });
      }

      const event_name = input.eventName;
      const event_data = input.eventData;

      const event_time = input.event_time ?? Math.floor(Date.now() / 1000);
      const randomNumber = Math.floor(Math.random() * 1_000_000_000);
      const fbp =
        input.customerInfo.fbp ?? `fb.1.${event_time}.${randomNumber}`;
      const user_data = input.customerInfo.fbc
        ? {
            client_user_agent: input.customerInfo.client_user_agent,
            client_ip_address:
              input.customerInfo.client_ip_address === "::1"
                ? "127.0.0.1"
                : input.customerInfo.client_ip_address,
            fbc: input.customerInfo.fbc,
            fbp,
          }
        : {
            client_user_agent: input.customerInfo.client_user_agent,
            client_ip_address:
              input.customerInfo.client_ip_address === "::1"
                ? "127.0.0.1"
                : input.customerInfo.client_ip_address,
            fbp,
          };

      await delay(4500);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const bodyData: any = {
        data: [
          {
            event_name,
            event_time: Math.floor(new Date().getTime() / 1000),
            action_source: "website",
            event_id: input.eventId,
            event_source_url: input.referer,
            user_data,
            ...event_data,
          },
        ],
      };

      // Nur hinzufügen, wenn `input.testEventCode` nicht null ist
      if (input.testEventCode) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        bodyData.test_event_code = input.testEventCode;
      }

      const response = await fetch(
        `https://graph.facebook.com/v21.0/${link.pixelId}/events?access_token=${link.accessToken}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bodyData),
        },
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = await response.json();

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return result;
    }),
});


const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));