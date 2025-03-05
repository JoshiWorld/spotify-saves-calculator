import { z } from "zod";
import { eachDayOfInterval, format, subDays } from "date-fns";
import { Redis } from "@upstash/redis";

import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import { env } from "@/env";

const redis = new Redis({
  url: env.KV_REST_API_URL,
  token: env.KV_REST_API_TOKEN,
});

export const linkstatsRouter = createTRPCRouter({
  get: protectedProcedure
    .input(z.object({ linkId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { linkId } = input;
      const link = await ctx.db.link.findUnique({
        where: {
          id: linkId
        },
        select: {
          splittestVersion: true,
        }
      });
      if(!link) throw Error("Link not found");

      // For Denny Video (Old Linkstats)
      if(linkId === "676e91ae7d5674a7d5047558") {
        const totalVisitsAggregate = await ctx.db.linkTracking.aggregate({
          _sum: {
            actions: true,
          },
          where: {
            event: "visit",
            link: {
              id: linkId
            }
          },
          orderBy: {
            createdAt: "desc"
          }
        });
        const totalClicksAggregate = await ctx.db.linkTracking.aggregate({
          _sum: {
            actions: true,
          },
          where: {
            event: "click",
            link: {
              id: linkId
            }
          },
          orderBy: {
            createdAt: "desc"
          }
        });
        const totalVisits = totalVisitsAggregate._sum.actions ?? 0;
        const totalClicks = totalClicksAggregate._sum.actions ?? 0;
        const conversionRate =
          totalVisits > 0 ? (totalClicks / totalVisits) * 100 : 0;

        return { visits: totalVisits, clicks: totalClicks, conversionRate: conversionRate };
      }

      const keyPattern = `stats:${linkId}:${link.splittestVersion}:*`;

      try {
        const keys = await redis.keys(keyPattern);

        if (!keys || keys.length === 0) {
          return { visits: 0, clicks: 0, conversionRate: 0 };
        }

        let totalVisits = 0;
        let totalClicks = 0;

        for (const key of keys) {
          try {
            const data = await redis.hgetall(key);

            if (data) {
              totalVisits += Number(data.visits) || 0;
              totalClicks += Number(data.clicks) || 0;
            }
          } catch (parseError) {
            console.error(
              `Fehler beim Abrufen der Daten für Schlüssel ${key}:`,
              parseError,
            );
          }
        }

        const conversionRate =
          totalVisits > 0 ? (totalClicks / totalVisits) * 100 : 0;

        return { visits: totalVisits, clicks: totalClicks, conversionRate };
      } catch (error) {
        console.error("Fehler beim Abrufen der Stats:", error);
        return { visits: 0, clicks: 0, conversionRate: 0 };
      }
    }),

  getRange: protectedProcedure
    .input(z.object({ linkId: z.string(), days: z.number() }))
    .query(async ({ ctx, input }) => {
      const { linkId, days } = input;
      const link = await ctx.db.link.findUnique({
        where: {
          id: linkId,
        },
        select: {
          splittestVersion: true,
        },
      });
      if (!link) throw Error("Link not found");

      const endDate = new Date(); // Heutiges Datum
      const startDate = subDays(endDate, days); // Startdatum (vor 'days' Tagen)
      const startDateBefore = subDays(startDate, days); // Startdatum des vorherigen Zeitraums

      try {
        // Funktion zum Abrufen und Aggregieren der Daten für einen Zeitraum
        const getAggregatedStats = async (startDate: Date, endDate: Date) => {
          const keyPattern = `stats:${linkId}:${link.splittestVersion}:*`;
          const allKeys = await redis.keys(keyPattern);

          if (!allKeys || allKeys.length === 0) {
            return { visits: 0, clicks: 0, conversionRate: 0 };
          }

          const relevantKeys = allKeys.filter((key) => {
            const dateString = key.split(":")[3];
            const keyDate = new Date(dateString!);
            return keyDate >= startDate && keyDate <= endDate;
          });

          let totalVisits = 0;
          let totalClicks = 0;

          for (const key of relevantKeys) {
            try {
              const data = await redis.hgetall(key);

              if (data) {
                totalVisits += Number(data.visits) || 0;
                totalClicks += Number(data.clicks) || 0;
              }
            } catch (parseError) {
              console.error(
                `Fehler beim Abrufen der Daten für Schlüssel ${key}:`,
                parseError,
              );
            }
          }

          const conversionRate =
            totalVisits > 0 ? (totalClicks / totalVisits) * 100 : 0;
          return { visits: totalVisits, clicks: totalClicks, conversionRate };
        };

        // Daten für den aktuellen Zeitraum abrufen
        const currentStats = await getAggregatedStats(startDate, endDate);

        // Daten für den vorherigen Zeitraum abrufen
        const previousStats = await getAggregatedStats(
          startDateBefore,
          startDate,
        );

        return {
          visits: currentStats.visits,
          clicks: currentStats.clicks,
          conversionRate: currentStats.conversionRate,
          visitsBefore: previousStats.visits,
          clicksBefore: previousStats.clicks,
          conversionRateBefore: previousStats.conversionRate,
        };
      } catch (error) {
        console.error("Fehler beim Abrufen der Daten aus Redis:", error);
        return {
          visits: 0,
          clicks: 0,
          conversionRate: 0,
          visitsBefore: 0,
          clicksBefore: 0,
          conversionRateBefore: 0,
        };
      }
    }),

  getDailyConversionRates: protectedProcedure
    .input(z.object({ linkId: z.string(), days: z.number() }))
    .query(async ({ ctx, input }) => {
      const { linkId, days } = input;
      const link = await ctx.db.link.findUnique({
        where: {
          id: linkId,
        },
        select: {
          splittestVersion: true,
        },
      });
      if (!link) throw Error("Link not found");

      const endDate = new Date(); // Heutiges Datum
      const startDate = subDays(endDate, days); // Startdatum (vor 'days' Tagen)

      try {
        // 1. Alle Tage im Zeitraum generieren
        const allDays = eachDayOfInterval({ start: startDate, end: endDate });

        // 2. Conversion Rates für jeden Tag abrufen
        const dailyConversionRates = await Promise.all(
          allDays.map(async (day) => {
            const dateString = format(day, "yyyy-MM-dd"); // Datum im Format YYYY-MM-DD
            const redisKey = `stats:${linkId}:${link.splittestVersion}:${dateString}`;

            try {
              const data = await redis.hgetall(redisKey);

              if (data) {
                const visits = Number(data.visits) || 0;
                const clicks = Number(data.clicks) || 0;
                const conversionRate = visits > 0 ? (clicks / visits) * 100 : 0;

                return { date: dateString, conversionRate };
              } else {
                return { date: dateString, conversionRate: 0 }; // Standardwert, wenn keine Daten vorhanden sind
              }
            } catch (error) {
              console.error(
                `Fehler beim Abrufen der Daten für Schlüssel ${redisKey}:`,
                error,
              );
              return { date: dateString, conversionRate: 0 }; // Standardwert bei Fehler
            }
          }),
        );

        return dailyConversionRates;
      } catch (error) {
        console.error("Fehler beim Abrufen der Daten aus Redis:", error);
        return [];
      }
    }),

  getAllTimeDailyConversionRates: protectedProcedure
    .input(z.object({ linkId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { linkId } = input;
      const link = await ctx.db.link.findUnique({
        where: {
          id: linkId,
        },
        select: {
          splittestVersion: true,
        },
      });
      if (!link) throw Error("Link not found");

      // For Denny Video (Old Linkstats)
      if(linkId === "676e91ae7d5674a7d5047558") {
        const visits = await ctx.db.linkTracking.findMany({
          where: {
            event: "visit",
            link: {
              id: linkId
            }
          },
          select: {
            actions: true,
            createdAt: true,
          }
        });
        const clicks = await ctx.db.linkTracking.findMany({
          where: {
            event: "click",
            link: {
              id: linkId,
            },
          },
          select: {
            actions: true,
            createdAt: true,
          },
        });

        const conversionRates = visits.map((visit) => {
          const click = clicks.find(
            (click) =>
              click.createdAt.toISOString().split("T")[0] ===
              visit.createdAt.toISOString().split("T")[0],
          );

          const visitCount = visit.actions;
          const clickCount = click ? click.actions : 0; 

          const conversionRate =
            visitCount > 0 ? (clickCount / visitCount) * 100 : 0;

          return {
            date: visit.createdAt, 
            conversionRate: conversionRate,
          };
        });

        return conversionRates;
      }

      const keyPattern = `stats:${linkId}:${link.splittestVersion}:*`;

      try {
        // 1. Alle relevanten Schlüssel finden
        const allKeys = await redis.keys(keyPattern);

        if (!allKeys || allKeys.length === 0) {
          return []; // Leeres Array, wenn keine Daten vorhanden sind
        }

        // 2. Eindeutige Datumsangaben extrahieren
        const uniqueDates = new Set<string>();
        allKeys.forEach((key) => {
          const dateString = key.split(":")[3];
          uniqueDates.add(dateString!);
        });

        // 3. Conversion Rates für jeden Tag abrufen
        const dailyConversionRates = await Promise.all(
          Array.from(uniqueDates).map(async (dateString) => {
            const redisKey = `stats:${linkId}:${dateString}`;

            try {
              const data = await redis.hgetall(redisKey);

              if (data) {
                const visits = Number(data.visits) || 0;
                const clicks = Number(data.clicks) || 0;
                const conversionRate = visits > 0 ? (clicks / visits) * 100 : 0;

                return { date: new Date(dateString), conversionRate };
              } else {
                return { date: new Date(dateString), conversionRate: 0 }; // Standardwert, wenn keine Daten vorhanden sind
              }
            } catch (error) {
              console.error(
                `Fehler beim Abrufen der Daten für Schlüssel ${redisKey}:`,
                error,
              );
              return { date: new Date(dateString), conversionRate: 0 }; // Standardwert bei Fehler
            }
          }),
        );

        // 4. Ergebnisse sortieren (optional)
        const sortedDailyConversionRates = dailyConversionRates.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        );

        return sortedDailyConversionRates;
      } catch (error) {
        console.error("Fehler beim Abrufen der Daten aus Redis:", error);
        return [];
      }
    }),

  getAggregatedStatsForUser: protectedProcedure.query(async ({ ctx }) => {
    try {
      // 1. Alle linkIds des Benutzers abrufen (aus der Datenbank)
      const links = await ctx.db.link.findMany({
        where: {
          user: {
            id: ctx.session.user.id,
          },
        },
        select: {
          id: true, // Nur die linkIds abrufen
        },
      });

      const linkIds = links.map((link) => link.id);

      if (!linkIds || linkIds.length === 0) {
        return { visits: 0, clicks: 0, conversionRate: 0 }; // Keine Links, keine Stats
      }

      // 2. Funktion zum Abrufen und Aggregieren der Daten für einen Link
      const getAggregatedStatsForLink = async (linkId: string) => {
        const link = await ctx.db.link.findUnique({
          where: {
            id: linkId,
          },
          select: {
            splittestVersion: true,
          },
        });
        if (!link) throw Error("Link not found");

        const keyPattern = `stats:${linkId}:${link.splittestVersion}:*`;

        const keys = await redis.keys(keyPattern);

        if (!keys || keys.length === 0) {
          return { visits: 0, clicks: 0 };
        }

        let totalVisits = 0;
        let totalClicks = 0;

        for (const key of keys) {
          try {
            const data = await redis.hgetall(key);

            if (data) {
              totalVisits += Number(data.visits) || 0;
              totalClicks += Number(data.clicks) || 0;
            }
          } catch (parseError) {
            console.error(
              `Fehler beim Abrufen der Daten für Schlüssel ${key}:`,
              parseError,
            );
          }
        }

        return { visits: totalVisits, clicks: totalClicks };
      };

      // 3. Daten für alle Links abrufen und aggregieren
      let totalVisits = 0;
      let totalClicks = 0;

      for (const linkId of linkIds) {
        const linkStats = await getAggregatedStatsForLink(linkId);
        totalVisits += linkStats.visits;
        totalClicks += linkStats.clicks;
      }

      const conversionRate =
        totalVisits > 0 ? (totalClicks / totalVisits) * 100 : 0;

      return { visits: totalVisits, clicks: totalClicks, conversionRate };
    } catch (error) {
      console.error("Fehler beim Abrufen der Daten aus Redis:", error);
      return { visits: 0, clicks: 0, conversionRate: 0 };
    }
  }),

  getAggregatedStatsForUserWithComparison: protectedProcedure
    .input(z.object({ days: z.number() }))
    .query(async ({ ctx, input }) => {
      const { days } = input;
      const endDate = new Date(); // Heutiges Datum
      const startDate = subDays(endDate, days); // Startdatum (vor 'days' Tagen)
      const startDateBefore = subDays(startDate, days); // Startdatum des vorherigen Zeitraums

      try {
        // 1. Alle linkIds des Benutzers abrufen (aus der Datenbank)
        const links = await ctx.db.link.findMany({
          where: {
            user: {
              id: ctx.session.user.id,
            },
          },
          select: {
            id: true, // Nur die linkIds abrufen
          },
        });

        const linkIds = links.map((link) => link.id);

        if (!linkIds || linkIds.length === 0) {
          return {
            visits: 0,
            clicks: 0,
            conversionRate: 0,
            visitsBefore: 0,
            clicksBefore: 0,
            conversionRateBefore: 0,
          }; // Keine Links, keine Stats
        }

        // 2. Funktion zum Abrufen und Aggregieren der Daten für einen Link und Zeitraum
        const getAggregatedStatsForLink = async (
          linkId: string,
          startDate: Date,
          endDate: Date,
        ) => {
          const link = await ctx.db.link.findUnique({
            where: {
              id: linkId,
            },
            select: {
              splittestVersion: true,
            },
          });
          if (!link) throw Error("Link not found");

          const keyPattern = `stats:${linkId}:${link.splittestVersion}:*`;
          const allKeys = await redis.keys(keyPattern);

          if (!allKeys || allKeys.length === 0) {
            return { visits: 0, clicks: 0 };
          }

          const relevantKeys = allKeys.filter((key) => {
            const dateString = key.split(":")[3];
            const keyDate = new Date(dateString!);
            return keyDate >= startDate && keyDate <= endDate;
          });

          let totalVisits = 0;
          let totalClicks = 0;

          for (const key of relevantKeys) {
            try {
              const data = await redis.hgetall(key);

              if (data) {
                totalVisits += Number(data.visits) || 0;
                totalClicks += Number(data.clicks) || 0;
              }
            } catch (parseError) {
              console.error(
                `Fehler beim Abrufen der Daten für Schlüssel ${key}:`,
                parseError,
              );
            }
          }

          return { visits: totalVisits, clicks: totalClicks };
        };

        // 3. Daten für alle Links und Zeiträume abrufen und aggregieren
        let totalVisits = 0;
        let totalClicks = 0;
        let totalVisitsBefore = 0;
        let totalClicksBefore = 0;

        for (const linkId of linkIds) {
          const currentStats = await getAggregatedStatsForLink(
            linkId,
            startDate,
            endDate,
          );
          totalVisits += currentStats.visits;
          totalClicks += currentStats.clicks;

          const previousStats = await getAggregatedStatsForLink(
            linkId,
            startDateBefore,
            startDate,
          );
          totalVisitsBefore += previousStats.visits;
          totalClicksBefore += previousStats.clicks;
        }

        const conversionRate =
          totalVisits > 0 ? (totalClicks / totalVisits) * 100 : 0;
        const conversionRateBefore =
          totalVisitsBefore > 0
            ? (totalClicksBefore / totalVisitsBefore) * 100
            : 0;

        return {
          visits: totalVisits,
          clicks: totalClicks,
          conversionRate,
          visitsBefore: totalVisitsBefore,
          clicksBefore: totalClicksBefore,
          conversionRateBefore,
        };
      } catch (error) {
        console.error("Fehler beim Abrufen der Daten aus Redis:", error);
        return {
          visits: 0,
          clicks: 0,
          conversionRate: 0,
          visitsBefore: 0,
          clicksBefore: 0,
          conversionRateBefore: 0,
        };
      }
    }),
});
