import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";

export const linkstatsRouter = createTRPCRouter({
  get: protectedProcedure
    .input(
      z.object({
        linkId: z.string(),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.db.linkTracking.findMany({
        where: {
            link: {
                id: input.linkId
            }
        }
      });
    }),

  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db.linkTracking.findMany({
      where: {
        link: {
          user: {
            id: ctx.session.user.id
          }
        }
      }
    })
  })
});
