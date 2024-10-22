import { z } from "zod";
import crypto from "crypto";

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

function hashData(data: string): string {
  return crypto
    .createHash("sha256")
    .update(data.trim().toLowerCase())
    .digest("hex");
}

export const metaRouter = createTRPCRouter({
  setAccessToken: protectedProcedure
    .input(
      z.object({
        code: z.string().min(4),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const redirect_uri =
        env.NODE_ENV !== "production"
          ? "http://localhost:3000/meta/callback"
          : "https://ssc.brokoly.de/meta/callback";

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
        testEventCode: z.string().nullable(),
        eventId: z.string(),
        eventData: z.object({
          content_category: z.string().optional(),
          content_name: z.string().optional(),
          currency: z.string().optional(),
          value: z.number().optional(),
        }),
        customerInfo: z.object({
          client_user_agent: z.string(),
          client_ip_address: z.string(),
          fbc: z.string().nullable(),
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
        include: {
          user: true,
        },
        cacheStrategy: {
          swr: 60,
          ttl: 60,
        },
      });
      if (!link) throw new Error(`Failed to fetch link`);

      const event_name = input.eventName;
      const event_data = input.eventData;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const hashedCustomerInfo = {
        em: input.customerInfo.email
          ? hashData(input.customerInfo.email)
          : undefined,
        ph: input.customerInfo.phone
          ? hashData(input.customerInfo.phone)
          : undefined,
        fn: input.customerInfo.firstName
          ? hashData(input.customerInfo.firstName)
          : undefined,
        ln: input.customerInfo.lastName
          ? hashData(input.customerInfo.lastName)
          : undefined,
        ct: input.customerInfo.city
          ? hashData(input.customerInfo.city)
          : undefined,
        zip: input.customerInfo.zip
          ? hashData(input.customerInfo.zip)
          : undefined,
        country: input.customerInfo.country
          ? hashData(input.customerInfo.country)
          : undefined,
      };

      const event_time = Math.floor(Date.now() / 1000);
      const fbc = `fb.0.${event_time}.${input.customerInfo.fbc}`;
      const randomNumber = Math.floor(Math.random() * 1_000_000_000);
      const fbp = `fb.0.${event_time}.${randomNumber}`;
      const user_data = {
        client_user_agent: input.customerInfo.client_user_agent,
        client_ip_address: input.customerInfo.client_ip_address,
        fbc,
        fbp,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const bodyData: any = {
        data: [
          {
            event_name,
            event_time,
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