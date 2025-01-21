import { z } from "zod";

import {
  adminProcedure,
  createTRPCRouter,
  publicProcedure,
} from "@/server/api/trpc";

export const whitelistRouter = createTRPCRouter({
  create: adminProcedure
    .input(
      z.object({
        name: z.string(),
        ip: z.string(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.whitelist.create({
        data: {
          name: input.name,
          ip: input.ip,
        },
      });
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.db.whitelist.delete({
        where: {
          id: input.id,
        },
      });
    }),

  getAll: adminProcedure.query(({ ctx }) => {
    return ctx.db.whitelist.findMany();
  }),

  get: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.whitelist.findUnique({
        where: {
          id: input.id,
        },
      });
    }),

  getByIP: adminProcedure
    .input(z.object({ ip: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.whitelist.findUnique({
        where: {
          ip: input.ip,
        },
      });
    }),

  update: adminProcedure
    .input(z.object({ id: z.string(), name: z.string(), ip: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.db.whitelist.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          ip: input.ip,
        },
      });
    }),

  getWhitelist: publicProcedure.query(({ ctx }) => {
    return ctx.db.whitelist.findMany({
      select: {
        ip: true,
      },
    }).then((result) => result.map(ip => ip.ip));
  }),
});
