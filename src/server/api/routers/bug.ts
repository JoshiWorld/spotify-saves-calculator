import { z } from "zod";

import { adminProcedure, createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { BugType } from "@prisma/client";

export const bugRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        type: z.nativeEnum(BugType),
        screenshot: z.string().optional().nullable(),
        message: z.string().min(3),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.bug.create({
        data: {
          user: { connect: { id: ctx.session.user.id } },
          screenshot: input.screenshot,
          message: input.message,
          type: input.type,
        },
      });
    }),

  resolve: adminProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.bug.update({
        where: {
          id: input.id,
        },
        data: {
          resolved: true,
        },
      });
    }),

  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db.bug.findMany({
      select: {
        id: true,
        message: true,
        resolved: true,
        createdAt: true,
        updatedAt: true,
        type: true,
      },
    });
  }),

  getBugs: protectedProcedure.query(({ ctx }) => {
    return ctx.db.bug.findMany({
      where: {
        type: BugType.BUG,
      },
      select: {
        id: true,
        message: true,
        resolved: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }),

  getFeatures: protectedProcedure.query(({ ctx }) => {
    return ctx.db.bug.findMany({
      where: {
        type: BugType.IMPROVEMENT,
      },
      select: {
        id: true,
        message: true,
        resolved: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.bug.findUnique({
        where: {
          id: input.id,
        },
        select: {
          id: true,
          message: true,
          resolved: true,
          screenshot: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              name: true,
            },
          },
        },
      });
    }),
});
