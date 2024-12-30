import { z } from "zod";
import { subDays } from "date-fns";

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
      }),
    )
    .query(async ({ ctx, input }) => {
      const daysAgo = subDays(new Date(), 7);
      const daysAgoBefore = subDays(new Date(), 14);

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

  getLinkClicks: protectedProcedure.input(z.object({
    id: z.string()
  })).query(async ({ ctx, input }) => {
    const daysAgo = subDays(new Date(), 7);
    const daysAgoBefore = subDays(new Date(), 14);

    const totalActions = await ctx.db.linkTracking.aggregate({
      _sum: {
        actions: true,
      },
      where: {
        event: "click",
        link: {
          id: input.id
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
          id: input.id
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
});
