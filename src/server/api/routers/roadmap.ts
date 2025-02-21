import { z } from "zod";

import {
  adminProcedure,
  createTRPCRouter,
  publicProcedure,
} from "@/server/api/trpc";
import { RoadmapStatus } from "@prisma/client";

export const roadmapRouter = createTRPCRouter({
  create: adminProcedure
    .input(
      z.object({
        title: z.string().min(3),
        description: z.string().min(3),
        category: z.string().min(2),
        status: z.nativeEnum(RoadmapStatus),
        targetDate: z.date(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.roadmapItem.create({
        data: {
          title: input.title,
          description: input.description,
          category: input.category,
          status: input.status,
          targetDate: input.targetDate,
        },
      });
    }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    const roadmapItems = await ctx.db.roadmapItem.findMany({
      select: {
        id: true,
        targetDate: true,
        title: true,
        description: true,
        status: true,
        category: true,
      },
    });

    return roadmapItems.map((item) => ({
      ...item,
      description: item.description.substring(0, 85),
    }));
  }),

  get: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.roadmapItem.findUnique({
        where: {
          id: input.id,
        },
        select: {
          id: true,
          targetDate: true,
          title: true,
          description: true,
          status: true,
          category: true,
        },
      });
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(3),
        description: z.string().min(3),
        category: z.string().min(2),
        status: z.nativeEnum(RoadmapStatus),
        targetDate: z.date(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.roadmapItem.update({
        where: {
          id: input.id,
        },
        data: {
          title: input.title,
          description: input.description,
          category: input.category,
          status: input.status,
          targetDate: input.targetDate,
        },
      });
    }),

  delete: adminProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.roadmapItem.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
