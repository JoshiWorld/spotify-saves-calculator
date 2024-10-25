import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";

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
        id: ctx.session.user.id
      },
      data: {
        metaAccessToken: null
      }
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

  updateSubscription: publicProcedure.input(
    z.object({
      email: z.string(),
    })
  ).mutation(async ({ ctx, input }) => {
    return ctx.db.user.update({
      where: {
        email: input.email
      },
      data: {
        package: "STARTER"
      }
    })
  }),
});
