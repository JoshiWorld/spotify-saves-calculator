import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
} from "@/server/api/trpc";

export const logRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        message: z.string(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.log.create({
        data: {
          message: input.message,
        },
      });
    }),
});
