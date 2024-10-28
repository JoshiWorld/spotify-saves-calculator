import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";

export const forumpostRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        content: z.string(),
        forumId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findFirst({
        where: {
          id: ctx.session.user.id,
        },
      });

      if (!user?.package && !user?.admin) {
        return false;
      }

      return ctx.db.forumPost.create({
        data: {
          title: input.title,
          content: input.content,
          user: { connect: { id: ctx.session.user.id } },
          forum: { connect: { id: input.forumId } },
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string(),
        content: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findFirst({
        where: {
          id: ctx.session.user.id,
        },
      });

      if (!user?.package && !user?.admin) {
        return false;
      }

      if (user.admin) {
        return ctx.db.forumPost.update({
          where: {
            id: input.id,
          },
          data: {
            title: input.title,
            content: input.content,
          },
        });
      }

      return ctx.db.forumPost.update({
        where: {
          id: input.id,
          user: { id: ctx.session.user.id },
        },
        data: {
          title: input.title,
          content: input.content,
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

      if (!user?.package && !user?.admin) {
        return false;
      }

      if(user.admin) {
        return ctx.db.forumPost.delete({
          where: {
            id: input.id,
          },
        });
      }

      return ctx.db.forumPost.delete({
        where: {
          id: input.id,
          user: { id: ctx.session.user.id },
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
      return ctx.db.forumPost.findFirst({
        where: {
          id: input.id,
        },
      });
    }),

  getAll: publicProcedure.input(z.object({
    forumId: z.string()
  })).query(({ ctx, input }) => {
    return ctx.db.forumPost.findMany({
      where: {
        forum: {
          id: input.forumId
        }
      }
    });
  }),
});
