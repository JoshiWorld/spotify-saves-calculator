import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

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
});
