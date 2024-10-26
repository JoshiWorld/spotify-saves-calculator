import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";

export const productRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
        internalName: z.string(),
        productId: z.string(),
        price: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findFirst({
        where: {
          id: ctx.session.user.id,
        },
      });

      if (!user?.admin) {
        return false;
      }

      return ctx.db.product.create({
        data: {
          title: input.title,
          description: input.description,
          internalName: input.internalName,
          productId: input.productId,
          price: input.price,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string(),
        description: z.string(),
        internalName: z.string(),
        productId: z.string(),
        price: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findFirst({
        where: {
          id: ctx.session.user.id,
        },
      });

      if (!user?.admin) {
        return false;
      }

      return ctx.db.product.update({
        where: {
          id: input.id,
        },
        data: {
          title: input.title,
          description: input.description,
          internalName: input.internalName,
          productId: input.productId,
          price: input.price,
        },
      });
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findFirst({
        where: {
          id: ctx.session.user.id,
        },
      });

      if (!user?.admin) {
        return false;
      }

      return ctx.db.product.delete({
        where: {
          id: input.id,
        },
      });
    }),

  get: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.db.product.findFirst({
        where: {
          id: input.id,
        },
      });
    }),

  getAll: publicProcedure
    .query(({ ctx }) => {
      return ctx.db.product.findMany();
    }),
});
