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
          client_user_agent: z.string(), //checked
          client_ip_address: z.string().nullable(), //checked
          fbc: z.string().nullable(), //checked
          fbp: z.string().nullable(), //checked
          ct: z.string().nullable(),
          st: z.string().nullable(),
          zp: z.string().nullable(),
          country: z.string().nullable(),
          external_id: z.string().nullable(),
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
          testEventCode: true,
          testMode: true,
        },
      });

      if (!link) {
        throw new Error(`Failed to fetch link`);
      }

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

      const city = input.customerInfo.ct
        ? hashSHA256(normalizeInputCity(input.customerInfo.ct))
        : undefined;
      const state = input.customerInfo.st
        ? hashSHA256(input.customerInfo.st.toLowerCase())
        : undefined;
      const zip = input.customerInfo.zp && input.customerInfo.st
        ? hashSHA256(normalizePostalCode(input.customerInfo.zp, input.customerInfo.st))
        : undefined;
      const country = input.customerInfo.country
        ? hashSHA256(input.customerInfo.country.toLowerCase())
        : undefined;
      const externalId = input.customerInfo.external_id
        ? hashSHA256(input.customerInfo.external_id)
        : undefined;

      // 2. Asynchroner Aufruf der Facebook API
      const facebookApiCall = async () => {
        const bodyData = {
          event_name: input.eventName,
          pixel_id: link.pixelId,
          access_token: link.accessToken,
          event_time:
            event_data.content_category === "visit"
              ? input.event_time
              : Math.floor(Date.now() / 1000),
          fbc: user_data.fbc,
          fbp: user_data.fbp,
          client_ip_address: input.customerInfo.client_ip_address ?? undefined,
          client_user_agent: input.customerInfo.client_user_agent,
          city,
          state,
          zip,
          country,
          externalId,
          content_name: event_data.content_name,
          content_category: event_data.content_category,
          event_source_url: input.referer,
          event_id: input.eventId,
          test_event_code: link.testMode ? link.testEventCode : undefined,
        };

        const response = await fetch("https://api.smartsavvy.eu/v1/track", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": env.TRACK_API_KEY,
          },
          body: JSON.stringify(bodyData),
        });

        if(!response.ok) {
          console.error('Error from MetaCAPI:', response.status)
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const data = await response.json();

        // const FACEBOOK_API_URL = `https://graph.facebook.com/v21.0/${bodyData.pixel_id}/events?access_token=${bodyData.access_token}`;
        // const facebookData = {
        //   event_name: `${bodyData.event_name} (${bodyData.pixel_id})`,
        //   pixel_id: bodyData.pixel_id,
        //   access_token: bodyData.access_token,
        //   data: [
        //     {
        //       event_name: bodyData.event_name,
        //       //event_time: Math.floor(Date.now() / 1000)+30,
        //       event_time: bodyData.event_time,
        //       user_data: {
        //         fbc: bodyData.fbc,
        //         fbp: bodyData.fbp,
        //         client_ip_address: bodyData.client_ip_address,
        //         client_user_agent: bodyData.client_user_agent,
        //         city: bodyData.city,
        //         state: bodyData.state,
        //         zip: bodyData.zip,
        //         country: bodyData.country,
        //         external_id: bodyData.externalId
        //       },
        //       custom_data: {
        //         content_name: bodyData.content_name,
        //         content_category: bodyData.content_category,
        //       },
        //       event_source_url: bodyData.event_source_url,
        //       event_id: bodyData.event_id,
        //       action_source: "website",
        //     },
        //   ],
        //   test_event_code: bodyData.test_event_code
        // };

        // const facebookResponse = await fetch(FACEBOOK_API_URL, {
        //   method: "POST",
        //   headers: {
        //     "Content-Type": "application/json",
        //   },
        //   body: JSON.stringify(facebookData)
        // })

        // // const facebookResponse = await axios.post(FACEBOOK_API_URL, facebookData);

        // if(facebookResponse.ok) {
        //   // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        //   const res = await facebookResponse.json();
        //   return {
        //     statusCode: 200,
        //     body: JSON.stringify({
        //       message: 'Event processed and counted successfully!',
        //       // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        //       facebookResponse: res,
        //     }),
        //   };
        // } else {
        //   // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        //   const res = await facebookResponse.json();
        //   return {
        //     statusCode: facebookResponse.status,
        //     body: JSON.stringify({
        //       message: facebookResponse.statusText,
        //       // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        //       facebookResponse: res
        //     })
        //   }
        // }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return data;
      };

      const updateRedis = async () => {
        const dateKey = new Date().toISOString().split("T")[0];
        const redisKey = `stats:${link.id}:${input.splittestVersion}:${dateKey}`;

        if (event_data.content_category === "click") {
          await redis.hincrby(redisKey, "clicks", 1);
        } else {
          await redis.hincrby(redisKey, "visits", 1);
        }
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const [data] = await Promise.all([facebookApiCall(), updateRedis()]);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = data ?? undefined;

      console.log('RESPONSE:', result);

      // console.info("Link:", input.linkName);
      // console.info('Event:', event_data.content_category);
      // console.info('FBC:', user_data.fbc);

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

function normalizeInputCity(input: string): string {
  return input
    .toLowerCase() // alles klein
    .normalize("NFD") // Umlaute/Sonderzeichen zerlegen (ä -> a + ¨)
    .replace(/[\u0300-\u036f]/g, "") // diakritische Zeichen entfernen
    .replace(/[^a-z]/g, ""); // alles raus, was nicht a-z ist
}

function normalizePostalCode(input: string, countryCode: string): string {
  const code = input.toLowerCase().replace(/[\s-]/g, ""); // alles klein, Leerzeichen & Bindestriche raus

  switch (countryCode.toUpperCase()) {
    case "US":
      // Nur die ersten 5 Ziffern
      return code.substring(0, 5);

    case "UK":
    case "GB":
      // UK Postcodes: Gebiet + Distrikt + Bezirk (alles zusammen)
      // Beispiel: "M1 1AE" -> "m11ae"
      return code;

    default:
      // Alle anderen Länder: einfach normalisieren
      return code;
  }
}