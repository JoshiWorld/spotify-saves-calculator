import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";

export const productRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        price: z.number(),
        subText: z.string().nullable().optional(),
        features: z.array(z.string()),
        featured: z.boolean(),
        buttonText: z.string(),
        additionalFeatures: z.array(z.string()),
        link: z.string(),
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
          name: input.name,
          price: input.price,
          subText: input.subText,
          features: input.features,
          featured: input.featured,
          buttonText: input.buttonText,
          additionalFeatures: input.additionalFeatures,
          link: input.link,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        price: z.number(),
        subText: z.string().nullable().optional(),
        features: z.array(z.string()),
        featured: z.boolean(),
        buttonText: z.string(),
        additionalFeatures: z.array(z.string()),
        link: z.string(),
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
          name: input.name,
          price: input.price,
          subText: input.subText,
          features: input.features,
          featured: input.featured,
          buttonText: input.buttonText,
          additionalFeatures: input.additionalFeatures,
          link: input.link,
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

  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.db.product.findMany({
      // cacheStrategy: {
      //   swr: 120,
      //   ttl: 120,
      // },
    });
  }),
});
