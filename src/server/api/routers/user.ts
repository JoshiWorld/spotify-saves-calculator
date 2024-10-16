import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const userRouter = createTRPCRouter({
  update: protectedProcedure
    .input(
      z.object({
        goodCPS: z.number(),
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
        },
      });
    }),

  get: protectedProcedure
    .query(async ({ ctx }) => {
      const user = await ctx.db.user.findFirst({
        where: {
          id: ctx.session.user.id,
        },
      });

      return user ?? null;
    }),
});
