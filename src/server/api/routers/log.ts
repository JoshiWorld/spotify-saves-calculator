import { z } from "zod";

import {
  adminProcedure,
  createTRPCRouter,
  publicProcedure,
} from "@/server/api/trpc";
import { type LogType } from "@prisma/client";

export const logRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        message: z.string(),
        logtype: z.string(),
      }),
    )
    .mutation(({ ctx, input }) => {
      const type = input.logtype.toUpperCase() as LogType;

      return ctx.db.log.create({
        data: {
          message: input.message,
          type
        },
      });
    }),
  
  getAll: adminProcedure.query(({ ctx }) => {
    return ctx.db.log.findMany();
  })
});
