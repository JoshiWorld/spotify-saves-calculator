import { z } from "zod";
import { eachDayOfInterval, format, startOfDay, subDays } from "date-fns";

import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";

export const linkstatsRouter = createTRPCRouter({
  get: protectedProcedure
    .input(
      z.object({
        linkId: z.string(),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.db.linkTracking.findMany({
        where: {
          link: {
            id: input.linkId,
          },
        },
      });
    }),

  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db.linkTracking.findMany({
      where: {
        link: {
          user: {
            id: ctx.session.user.id,
          },
        },
      },
    });
  }),

  getVisits: protectedProcedure.query(async ({ ctx }) => {
    const daysAgo = subDays(new Date(), 7);
    const daysAgoBefore = subDays(new Date(), 14);

    const totalActions = await ctx.db.linkTracking.aggregate({
      _sum: {
        actions: true,
      },
      where: {
        event: "visit",
        link: {
          user: {
            id: ctx.session.user.id,
          },
        },
        createdAt: {
          gte: daysAgo,
        },
      },
    });

    const totalActionsBefore = await ctx.db.linkTracking.aggregate({
      _sum: {
        actions: true,
      },
      where: {
        event: "visit",
        link: {
          user: {
            id: ctx.session.user.id,
          },
        },
        createdAt: {
          gte: daysAgoBefore,
          lte: daysAgo,
        },
      },
    });

    return {
      totalActions: totalActions._sum.actions ?? 0,
      totalActionsBefore: totalActionsBefore._sum.actions ?? 0,
    };
  }),

  getClicks: protectedProcedure.query(async ({ ctx }) => {
    const daysAgo = subDays(new Date(), 7);
    const daysAgoBefore = subDays(new Date(), 14);

    const totalActions = await ctx.db.linkTracking.aggregate({
      _sum: {
        actions: true,
      },
      where: {
        event: "click",
        link: {
          user: {
            id: ctx.session.user.id,
          },
        },
        createdAt: {
          gte: daysAgo,
        },
      },
    });

    const totalActionsBefore = await ctx.db.linkTracking.aggregate({
      _sum: {
        actions: true,
      },
      where: {
        event: "click",
        link: {
          user: {
            id: ctx.session.user.id,
          },
        },
        createdAt: {
          gte: daysAgoBefore,
          lte: daysAgo,
        },
      },
    });

    return {
      totalActions: totalActions._sum.actions ?? 0,
      totalActionsBefore: totalActionsBefore._sum.actions ?? 0,
    };
  }),

  getLinkVisits: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        days: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const daysAgo = subDays(new Date(), input.days);
      const daysAgoBefore = subDays(new Date(), input.days*2);

      const totalActions = await ctx.db.linkTracking.aggregate({
        _sum: {
          actions: true,
        },
        where: {
          event: "visit",
          link: {
            id: input.id,
          },
          createdAt: {
            gte: daysAgo,
          },
        },
      });

      const totalActionsBefore = await ctx.db.linkTracking.aggregate({
        _sum: {
          actions: true,
        },
        where: {
          event: "visit",
          link: {
            id: input.id,
          },
          createdAt: {
            gte: daysAgoBefore,
            lte: daysAgo,
          },
        },
      });

      return {
        totalActions: totalActions._sum.actions ?? 0,
        totalActionsBefore: totalActionsBefore._sum.actions ?? 0,
      };
    }),

  getLinkVisitsAlltime: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const totalActions = await ctx.db.linkTracking.aggregate({
        _sum: {
          actions: true,
        },
        where: {
          event: "visit",
          link: {
            id: input.id,
          },
        },
      });

      return {
        totalActions: totalActions._sum.actions ?? 0,
      };
    }),

  getLinkClicks: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        days: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const daysAgo = subDays(new Date(), input.days);
      const daysAgoBefore = subDays(new Date(), input.days*2);

      const totalActions = await ctx.db.linkTracking.aggregate({
        _sum: {
          actions: true,
        },
        where: {
          event: "click",
          link: {
            id: input.id,
          },
          createdAt: {
            gte: daysAgo,
          },
        },
      });

      const totalActionsBefore = await ctx.db.linkTracking.aggregate({
        _sum: {
          actions: true,
        },
        where: {
          event: "click",
          link: {
            id: input.id,
          },
          createdAt: {
            gte: daysAgoBefore,
            lte: daysAgo,
          },
        },
      });

      return {
        totalActions: totalActions._sum.actions ?? 0,
        totalActionsBefore: totalActionsBefore._sum.actions ?? 0,
      };
    }),

  getLinkClicksAlltime: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const totalActions = await ctx.db.linkTracking.aggregate({
        _sum: {
          actions: true,
        },
        where: {
          event: "click",
          link: {
            id: input.id,
          },
        },
      });

      return {
        totalActions: totalActions._sum.actions ?? 0,
      };
    }),

  getConversion: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const today = startOfDay(new Date());
      const daysAgo = subDays(today, 14);

      const days = eachDayOfInterval({
        start: daysAgo,
        end: today,
      });

      const dailyStats = await Promise.all(
        days.map(async (day) => {
          const nextDay = subDays(day, -1);

          const clicks = await ctx.db.linkTracking.aggregate({
            _sum: {
              actions: true,
            },
            where: {
              event: "click",
              link: {
                id: input.id,
              },
              createdAt: {
                gte: day,
                lt: nextDay,
              },
            },
          });

          const visits = await ctx.db.linkTracking.aggregate({
            _sum: {
              actions: true,
            },
            where: {
              event: "visit",
              link: {
                id: input.id,
              },
              createdAt: {
                gte: day,
                lt: nextDay,
              },
            },
          });

          const clicksCount = clicks._sum.actions ?? 0;
          const visitsCount = visits._sum.actions ?? 0;

          // Conversion Rate berechnen
          const conversionRate =
            visitsCount > 0 ? (clicksCount / visitsCount) * 100 : 0;

          return {
            date: format(day, "yyyy-MM-dd"),
            clicks: clicksCount,
            visits: visitsCount,
            conversionRate,
          };
        }),
      );

      return dailyStats;
    }),
});
