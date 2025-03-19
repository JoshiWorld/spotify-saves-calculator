import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
} from "@/server/api/trpc";
import { headers } from "next/headers";
import { createHash } from "crypto";

const getIPv4 = (ipString: string | null) => {
  if (!ipString) return null;

  const ips = ipString.split(",");

  const ipv4Regex = /(\d{1,3}\.){3}\d{1,3}/;
  for (const ip of ips) {
    const match = ipv4Regex.exec(ip.trim());
    if (match) {
      return match[0];
    }
  }

  return null;
};

function hashValue(value: string, algorithm = "sha256"): string {
  const hash = createHash(algorithm);
  hash.update(value);
  return hash.digest("hex");
}

// function compareHash(
//   originalValue: string,
//   hashedValue: string,
//   algorithm = "sha256",
// ): boolean {
//   const newHash = hashValue(originalValue, algorithm);
//   return newHash === hashedValue;
// }

export const consentRouter = createTRPCRouter({
  update: publicProcedure
    .input(
      z.object({
        anonymousId: z.string(),
        consentGiven: z.boolean(),
        consentType: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const headersList = await headers();
      const xForwardedFor = headersList.get("x-forwarded-for");
      const clientIp =
        getIPv4(xForwardedFor) ?? headersList.get("x-forwarded-for");
      const ipHash = clientIp ? hashValue(clientIp) : null;

      if (ctx.session) {
        return ctx.db.consent.update({
          where: {
            anonymousId: input.anonymousId,
          },
          data: {
            consentGiven: input.consentGiven,
            consentType: input.consentType,
            user: { connect: { id: ctx.session.user.id } },
            ipHash,
          },
        });
      }

      return ctx.db.consent.update({
        where: {
          anonymousId: input.anonymousId,
        },
        data: {
          consentGiven: input.consentGiven,
          consentType: input.consentType,
          ipHash,
        },
      });
    }),

  create: publicProcedure.input(
    z.object({
      anonymousId: z.string(),
      consentGiven: z.boolean(),
      consentType: z.string(),
    }),
  ).mutation(async ({ ctx, input }) => {
    const headersList = await headers();
    const xForwardedFor = headersList.get("x-forwarded-for");
    const clientIp =
      getIPv4(xForwardedFor) ?? headersList.get("x-forwarded-for");
    const ipHash = clientIp ? hashValue(clientIp) : null;

    if (ctx.session) {
      return ctx.db.consent.create({
        data: {
          anonymousId: input.anonymousId,
          consentGiven: input.consentGiven,
          consentType: input.consentType,
          user: { connect: { id: ctx.session.user.id } },
          ipHash,
        },
      });
    }

    return ctx.db.consent.create({
      data: {
        anonymousId: input.anonymousId,
        consentGiven: input.consentGiven,
        consentType: input.consentType,
        ipHash,
      },
    });
  }),
});
