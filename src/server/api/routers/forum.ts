import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const forumRouter = createTRPCRouter({
  /* CATEGORIES START */
  createCategory: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: {
          id: ctx.session.user.id,
        },
        select: {
          admin: true,
        },
      });

      if (!user?.admin) return false;

      return ctx.db.category.create({
        data: {
          name: input.name,
          description: input.description,
        },
      });
    }),
  updateCategory: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        description: z.string().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: {
          id: ctx.session.user.id,
        },
        select: {
          admin: true,
        },
      });

      if (!user?.admin) return false;

      return ctx.db.category.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          description: input.description,
        },
      });
    }),
  deleteCategory: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: {
          id: ctx.session.user.id,
        },
        select: {
          admin: true,
        },
      });

      if (!user?.admin) return false;

      return ctx.db.category.delete({
        where: {
          id: input.id,
        },
      });
    }),
  getCategory: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.db.category.findFirst({
        where: {
          id: input.id,
        },
        cacheStrategy: {
          swr: 60,
          ttl: 60,
        },
      });
    }),
  getCategories: protectedProcedure.query(({ ctx }) => {
    return ctx.db.category.findMany({
      select: {
        id: true,
        name: true,
        description: true,
      },
      cacheStrategy: {
        swr: 60,
        ttl: 60,
      },
    });
  }),
  /* CATEGORIES END */

  /* THREAD START */
  createThread: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        categoryId: z.string(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.thread.create({
        data: {
          title: input.title,
          user: {
            connect: {
              id: ctx.session.user.id,
            },
          },
          category: {
            connect: {
              id: input.categoryId,
            },
          },
        },
      });
    }),
  updateThread: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string(),
        categoryId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: {
          id: ctx.session.user.id,
        },
        select: {
          admin: true,
        },
      });

      if (user?.admin) {
        return ctx.db.thread.update({
          where: {
            id: input.id,
          },
          data: {
            title: input.title,
            category: {
              connect: {
                id: input.categoryId,
              },
            },
          },
        });
      }

      return ctx.db.thread.update({
        where: {
          id: input.id,
          user: {
            id: ctx.session.user.id,
          },
        },
        data: {
          title: input.title,
          category: {
            connect: {
              id: input.categoryId,
            },
          },
        },
      });
    }),
  deleteThread: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: {
          id: ctx.session.user.id,
        },
        select: {
          admin: true,
        },
      });

      if (user?.admin) {
        return ctx.db.thread.delete({
          where: {
            id: input.id,
          },
        });
      }

      return ctx.db.thread.delete({
        where: {
          id: input.id,
          user: {
            id: ctx.session.user.id,
          },
        },
      });
    }),
  getThread: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.db.thread.findFirst({
        where: {
          id: input.id,
        },
        cacheStrategy: {
          swr: 60,
          ttl: 60,
        },
      });
    }),
  getThreads: protectedProcedure
    .input(
      z.object({
        categoryId: z.string(),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.db.thread.findMany({
        where: {
          category: {
            id: input.categoryId,
          },
        },
        select: {
          id: true,
          title: true,
        },
        cacheStrategy: {
          swr: 60,
          ttl: 60,
        },
      });
    }),
  /* THREAD END */

  /* POST START */
  createPost: protectedProcedure
    .input(
      z.object({
        content: z.string(),
        threadId: z.string(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.forumPost.create({
        data: {
          content: input.content,
          user: {
            connect: {
              id: ctx.session.user.id,
            },
          },
          thread: {
            connect: {
              id: input.threadId,
            },
          },
        },
      });
    }),
  updatePost: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        content: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: {
          id: ctx.session.user.id,
        },
        select: {
          admin: true,
        },
      });

      if (user?.admin) {
        return ctx.db.forumPost.update({
          where: {
            id: input.id,
          },
          data: {
            content: input.content,
          },
        });
      }

      return ctx.db.forumPost.update({
        where: {
          id: input.id,
          user: {
            id: ctx.session.user.id,
          },
        },
        data: {
          content: input.content,
        },
      });
    }),
  deletePost: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: {
          id: ctx.session.user.id,
        },
        select: {
          admin: true,
        },
      });

      if (user?.admin) {
        return ctx.db.forumPost.delete({
          where: {
            id: input.id,
          },
        });
      }

      return ctx.db.forumPost.delete({
        where: {
          id: input.id,
          user: {
            id: ctx.session.user.id,
          },
        },
      });
    }),
  getPost: protectedProcedure
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
        cacheStrategy: {
          swr: 60,
          ttl: 60,
        },
      });
    }),
  getPosts: protectedProcedure
    .input(
      z.object({
        threadId: z.string(),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.db.forumPost.findMany({
        where: {
          thread: {
            id: input.threadId,
          },
        },
        select: {
          id: true,
          content: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              name: true,
              image: true,
            },
          },
          votes: {
            select: {
              vote: true,
            },
          },
        },
        cacheStrategy: {
          swr: 60,
          ttl: 60,
        },
      });
    }),
  /* POST END */

  /* COMMENT START */
  createComment: protectedProcedure
    .input(
      z.object({
        content: z.string(),
        postId: z.string(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.comment.create({
        data: {
          content: input.content,
          user: {
            connect: {
              id: ctx.session.user.id,
            },
          },
          post: {
            connect: {
              id: input.postId,
            },
          },
        },
      });
    }),
  updateComment: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        content: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: {
          id: ctx.session.user.id,
        },
        select: {
          admin: true,
        },
      });

      if (user?.admin) {
        return ctx.db.comment.update({
          where: {
            id: input.id,
          },
          data: {
            content: input.content,
          },
        });
      }

      return ctx.db.comment.update({
        where: {
          id: input.id,
          user: {
            id: ctx.session.user.id,
          },
        },
        data: {
          content: input.content,
        },
      });
    }),
  deleteComment: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: {
          id: ctx.session.user.id,
        },
        select: {
          admin: true,
        },
      });

      if (user?.admin) {
        return ctx.db.comment.delete({
          where: {
            id: input.id,
          },
        });
      }

      return ctx.db.comment.delete({
        where: {
          id: input.id,
          user: {
            id: ctx.session.user.id,
          },
        },
      });
    }),
  getComment: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.db.comment.findFirst({
        where: {
          id: input.id,
        },
        cacheStrategy: {
          swr: 60,
          ttl: 60,
        },
      });
    }),
  getComments: protectedProcedure
    .input(
      z.object({
        postId: z.string(),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.db.comment.findMany({
        where: {
          post: {
            id: input.postId,
          },
        },
        select: {
          id: true,
          content: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
        cacheStrategy: {
          swr: 60,
          ttl: 60,
        },
      });
    }),
  /* COMMENT END */

  /* TAG START */
  createTag: protectedProcedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.tag.create({
        data: {
          name: input.name,
        },
      });
    }),
  updateTag: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: {
          id: ctx.session.user.id,
        },
        select: {
          admin: true,
        },
      });

      if (!user?.admin) return false;

      return ctx.db.tag.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
        },
      });
    }),
  deleteTag: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: {
          id: ctx.session.user.id,
        },
        select: {
          admin: true,
        },
      });

      if (!user?.admin) return false;

      return ctx.db.tag.delete({
        where: {
          id: input.id,
        },
      });
    }),
  getTag: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.db.tag.findFirst({
        where: {
          id: input.id,
        },
        cacheStrategy: {
          swr: 60,
          ttl: 60,
        },
      });
    }),
  getTags: protectedProcedure.query(({ ctx }) => {
    return ctx.db.tag.findMany({
      select: {
        id: true,
        name: true,
      },
      cacheStrategy: {
        swr: 60,
        ttl: 60,
      },
    });
  }),
  /* TAG END */

  /* VOTE START */
  createVote: protectedProcedure
    .input(
      z.object({
        vote: z.number(),
        postId: z.string(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.vote.create({
        data: {
          vote: input.vote,
          post: {
            connect: {
              id: input.postId,
            },
          },
          user: {
            connect: {
              id: ctx.session.user.id,
            },
          },
        },
      });
    }),
  updateVote: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        vote: z.number(),
        postId: z.string(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.vote.update({
        where: {
          id: input.id,
          user: {
            id: ctx.session.user.id
          },
          post: {
            id: input.postId
          }
        },
        data: {
          vote: input.vote,
        },
      });
    }),
  deleteVote: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        postId: z.string(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.vote.delete({
        where: {
          id: input.id,
          user: {
            id: ctx.session.user.id
          },
          post: {
            id: input.postId
          }
        },
      });
    }),
  getVote: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.db.vote.findFirst({
        where: {
          id: input.id,
        },
        cacheStrategy: {
          swr: 60,
          ttl: 60,
        },
      });
    }),
  getVotes: protectedProcedure.input(z.object({
    postId: z.string()
  })).query(({ ctx, input }) => {
    return ctx.db.vote.findMany({
      where: {
        post: {
          id: input.postId
        }
      },
      select: {
        vote: true,
      },
      cacheStrategy: {
        swr: 60,
        ttl: 60,
      },
    });
  }),
  /* VOTE END */
});
