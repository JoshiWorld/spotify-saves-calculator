import { z } from "zod";
// import crypto from "crypto";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { env } from "@/env";
import { createHash } from "crypto";
import { SplittestVersion } from "@prisma/client";
import { Redis } from "@upstash/redis";
import axios from "axios";

const redis = new Redis({
  url: env.KV_REST_API_URL,
  token: env.KV_REST_API_TOKEN,
});

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
        splittestVersion: z.nativeEnum(SplittestVersion).nullable(),
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
          client_ip_address: z.string().nullable(),
          fbc: z.string().nullable(),
          fbp: z.string().nullable(),
          email: z.string().optional(),
          phone: z.string().optional(),
          firstName: z.string().optional(),
          lastName: z.string().optional(),
          city: z.string().optional(),
          zip: z.string().optional(),
          countryCode: z.string().optional().nullable(),
        }),
        referer: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // console.log('DEBUGTIMESTART:', new Date());
      // 1. Link-Daten abrufen (mit Selektion der benötigten Felder)
      const link = await ctx.db.link.findFirst({
        where: {
          name: input.linkName,
        },
        select: {
          id: true,
          accessToken: true,
          pixelId: true,
          testEventCode: true,
          testMode: true,
        },
      });

      if (!link) {
        throw new Error(`Failed to fetch link`);
      }

      const event_name = input.eventName;
      const event_data = input.eventData;
      const event_time =
        input.event_time && input.event_time > 0
          ? input.event_time
          : Math.floor(Date.now() / 1000);
      const randomNumber = Math.floor(Math.random() * 1_000_000_000);
      const fbp =
        input.customerInfo.fbp ?? `fb.1.${event_time}.${randomNumber}`;

      const user_data = {
        client_user_agent: input.customerInfo.client_user_agent,
        client_ip_address: normalizeIp(input.customerInfo.client_ip_address),
        fbp,
        fbc: input.customerInfo.fbc ?? undefined,
      };

      const country = input.customerInfo.countryCode
        ? hashSHA256(input.customerInfo.countryCode)
        : undefined;

      // console.log("DEBUGTIMEBEFORE FACEBOOKCALL:", new Date());

      // const bodyData = {
      //   pixel_id: link.pixelId,
      //   event_name,
      //   linkId: link.id,
      //   splittestVersion: input.splittestVersion,
      //   access_token: link.accessToken,
      //   test_event_code: link.testMode ? link.testEventCode : null,
      //   event_id: input.eventId,
      //   referer: input.referer,
      //   content_name: event_data.content_name,
      //   content_category: event_data.content_category,
      //   fbc: user_data.fbc ?? null,
      //   fbp,
      //   country,
      //   event_time:
      //     event_data.content_category === "visit"
      //       ? input.event_time
      //       : Math.floor(Date.now() / 1000),
      //   client_ip_address: normalizeIp(user_data.client_ip_address),
      //   client_user_agent: user_data.client_user_agent,
      // };

      // 2. Asynchroner Aufruf der Facebook API
      const facebookApiCall = async () => {
        const FACEBOOK_API_URL = `https://graph.facebook.com/v21.0/${link.pixelId}/events?access_token=${link.accessToken}`;

        const facebookData = {
          event_name: `${event_name} (${link.pixelId})`,
          pixel_id: link.pixelId,
          access_token: link.accessToken,
          data: [
            {
              event_name,
              //event_time: Math.floor(Date.now() / 1000)+30,
              event_time: Math.floor(Date.now() / 1000),
              user_data: {
                fbc: user_data.fbc,
                fbp,
                client_ip_address: normalizeIp(user_data.client_ip_address),
                client_user_agent: user_data.client_user_agent,
                country, 
              },
              custom_data: {
                content_name: event_data.content_name,
                content_category: event_data.content_category,
              },
              event_source_url: input.referer,
              event_id: input.eventId,
              action_source: "website",
            },
          ],
          test_event_code: link.testMode ? link.testEventCode : undefined,
        };

        const facebookResponse = await axios.post(
          FACEBOOK_API_URL,
          facebookData,
        );

        // API CALL
        // const response = await fetch("https://api.smartsavvy.eu/v1/track", {
        //   method: "POST",
        //   headers: {
        //     "Content-Type": "application/json",
        //     "x-api-key": env.TRACK_API_KEY,
        //   },
        //   body: JSON.stringify(bodyData),
        // });

        if (facebookResponse.status !== 200) {
          console.error(
            "Error from Meta API:",
            facebookResponse.status,
            facebookResponse.data,
          );
        }
        return facebookResponse;
      };

      // console.log("DEBUGTIMEBEFORE REDIS:", new Date());

      // 3. Redis aktualisieren (asynchron, nicht-blockierend)
      const updateRedis = async () => {
        const dateKey = new Date().toISOString().split("T")[0];
        const redisKey = `stats:${link.id}:${input.splittestVersion}:${dateKey}`;

        if (event_data.content_category === "click") {
          await redis.hincrby(redisKey, "clicks", 1);
        } else {
          await redis.hincrby(redisKey, "visits", 1);
        }
      };

      // 4. Beide Operationen parallel starten
      const [facebookResponse] = await Promise.all([
        facebookApiCall(),
        updateRedis(),
      ]);

      // console.log("DEBUGTIMEAFTER PARALLEL REDIS:", new Date());

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = facebookResponse
        ? facebookResponse.data
        : undefined;

      // console.log("DEBUGTIMEEND:", new Date());

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return result;
    }),
});

// const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function hashSHA256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function ipv4ToIpv6(ipv4: string): string {
  const parts = ipv4.split(".").map(Number);
  if (parts.length !== 4 || parts.some((n) => isNaN(n) || n < 0 || n > 255)) {
    throw new Error("Ungültige IPv4-Adresse");
  }
  return `::ffff:${parts.join(".")}`;
}

function normalizeIp(ip: string | null): string {
  // Prüft, ob es eine IPv4-Adresse ist
  const ipv4Regex = /^(?:\d{1,3}\.){3}\d{1,3}$/;
  const placeholderIp = "127.0.0.1";

  return ipv4Regex.test(ip ?? placeholderIp) ? ipv4ToIpv6(ip ?? placeholderIp) : ip ?? placeholderIp;
}