import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { Package } from "@prisma/client";

export const userRouter = createTRPCRouter({
  update: protectedProcedure
    .input(
      z.object({
        goodCPS: z.number(),
        name: z.string(),
        image: z.string(),
        midCPS: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          goodCPS: input.goodCPS,
          midCPS: input.midCPS,
          name: input.name,
          image: input.image,
        },
      });
    }),

  removeMetaAccess: protectedProcedure.mutation(({ ctx }) => {
    return ctx.db.user.update({
      where: {
        id: ctx.session.user.id,
      },
      data: {
        metaAccessToken: null,
      },
    });
  }),

  get: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findFirst({
      where: {
        id: ctx.session.user.id,
      },
    });

    return user ?? null;
  }),

  delete: protectedProcedure.mutation(async ({ ctx }) => {
    return ctx.db.user.delete({
      where: {
        id: ctx.session.user.id,
      },
    });
  }),

  updateSubscription: publicProcedure
    .input(
      z.object({
        email: z.string(),
        productName: z.string().nullable().optional(),
      }),
    )
    .mutation(({ ctx, input }) => {
      let product: Package | null = null;

      switch (input.productName) {
        case "smartsavvy_starter":
          product = Package.STARTER;
          break;
        case "smartsavvy_artist":
          product = Package.ARTIST;
          break;
        case "smartsavvy_label":
          product = Package.LABEL;
          break;
        default:
          product = null;
      }

      return ctx.db.user.update({
        where: {
          email: input.email,
        },
        data: {
          package: product,
        },
      });
    }),
});
