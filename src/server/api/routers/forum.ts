import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { VoteType } from "@prisma/client";

export const forumRouter = createTRPCRouter({
  /* POSTS START */
  createPost: protectedProcedure
    .input(
      z.object({
        title: z
          .string()
          .min(3, {
            message: "Der Titel muss mindestens 3 Zeichen lang sein.",
          })
          .max(128, {
            message:
              "Der Titel hat die Maximallänge von 128 Zeichen überschritten.",
          }),
        content: z.any(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: {
          id: ctx.session.user.id,
        },
        select: {
          package: true,
          admin: true,
        },
      });

      if (!user?.package && !user?.admin) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Du hast hier keinen Zugriff drauf.",
        });
      }

      return ctx.db.forumPost.create({
        data: {
          title: input.title,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          content: input.content,
          author: {
            connect: {
              id: ctx.session.user.id,
            },
          },
        },
      });
    }),

  votePost: protectedProcedure
    .input(
      z.object({
        postId: z.string(),
        voteType: z.nativeEnum(VoteType),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: {
          id: ctx.session.user.id,
        },
        select: {
          package: true,
          admin: true,
        },
      });

      if (!user?.package && !user?.admin) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Du hast hier keinen Zugriff drauf.",
        });
      }

      const existingVote = await ctx.db.vote.findFirst({
        where: {
          user: {
            id: ctx.session.user.id,
          },
          post: {
            id: input.postId,
          },
        },
        select: {
          id: true,
          type: true,
        },
      });

      const post = await ctx.db.forumPost.findUnique({
        where: {
          id: input.postId,
        },
        select: {
          id: true,
        },
      });

      if (!post) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Dieser Post existiert nicht.",
        });
      }

      if (existingVote) {
        if (existingVote.type === input.voteType) {
          return ctx.db.vote.delete({
            where: {
              id: existingVote.id,
            },
          });
        }

        return ctx.db.vote.update({
          where: {
            id: existingVote.id,
          },
          data: {
            type: input.voteType,
          },
        });
      }

      return ctx.db.vote.create({
        data: {
          type: input.voteType,
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

  getPost: protectedProcedure
    .input(z.object({ postId: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: {
          id: ctx.session.user.id,
        },
        select: {
          package: true,
          admin: true,
        },
      });

      if (!user?.package && !user?.admin) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Du hast hier keinen Zugriff drauf.",
        });
      }

      return ctx.db.forumPost.findUnique({
        where: {
          id: input.postId,
        },
        select: {
          _count: {
            select: {
              comments: true,
            },
          },
          author: {
            select: {
              name: true,
              image: true,
            },
          },
          content: true,
          createdAt: true,
          id: true,
          title: true,
          votes: {
            select: {
              type: true,
            },
          },
        },
      });
    }),

  getPosts: protectedProcedure
    .input(z.object({ page: z.number() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: {
          id: ctx.session.user.id,
        },
        select: {
          package: true,
          admin: true,
        },
      });

      if (!user?.package && !user?.admin) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Du hast hier keinen Zugriff drauf.",
        });
      }

      const { page } = input;
      const limit = 5;
      const postsToSkip = (page - 1) * limit;

      const [posts, totalCount] = await Promise.all([
        ctx.db.forumPost.findMany({
          take: limit,
          skip: postsToSkip,
          orderBy: {
            createdAt: "desc",
          },
          select: {
            author: {
              select: {
                name: true,
                image: true,
              },
            },
            id: true,
            title: true,
            createdAt: true,
            _count: {
              select: {
                comments: true,
              },
            },
            votes: {
              select: {
                user: {
                  select: {
                    id: true,
                  },
                },
                type: true,
              },
            },
          },
        }),
        ctx.db.forumPost.count(), // Gesamtzahl der Beiträge abrufen
      ]);

      const hasNextPage = postsToSkip + limit < totalCount; // Berechnen, ob es noch mehr Beiträge gibt

      return {
        items: posts,
        hasNextPage,
      };
    }),
  /* POSTS END */

  /* COMMENTS START */
  comment: protectedProcedure
    .input(
      z.object({
        postId: z.string(),
        text: z.string(),
        replyToId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: {
          id: ctx.session.user.id,
        },
        select: {
          package: true,
          admin: true,
        },
      });

      if (!user?.package && !user?.admin) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Du hast hier keinen Zugriff drauf.",
        });
      }

      const data = input.replyToId
        ? {
            text: input.text,
            post: {
              connect: {
                id: input.postId,
              },
            },
            author: {
              connect: {
                id: ctx.session.user.id,
              },
            },
            replyTo: {
              connect: {
                id: input.replyToId,
              },
            },
          }
        : {
            text: input.text,
            post: {
              connect: {
                id: input.postId,
              },
            },
            author: {
              connect: {
                id: ctx.session.user.id,
              },
            },
          };

      return ctx.db.comment.create({ data });
    }),

  voteComment: protectedProcedure
    .input(
      z.object({
        commentId: z.string(),
        voteType: z.nativeEnum(VoteType),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: {
          id: ctx.session.user.id,
        },
        select: {
          package: true,
          admin: true,
        },
      });

      if (!user?.package && !user?.admin) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Du hast hier keinen Zugriff drauf.",
        });
      }

      const existingVote = await ctx.db.commentVote.findFirst({
        where: {
          user: {
            id: ctx.session.user.id,
          },
          comment: {
            id: input.commentId,
          },
        },
        select: {
          id: true,
          type: true,
        },
      });

      const comment = await ctx.db.comment.findUnique({
        where: {
          id: input.commentId,
        },
        select: {
          id: true,
        },
      });

      if (!comment) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Dieser Kommentar existiert nicht.",
        });
      }

      if (existingVote) {
        if (existingVote.type === input.voteType) {
          return ctx.db.commentVote.delete({
            where: {
              id: existingVote.id,
            },
          });
        }

        return ctx.db.commentVote.update({
          where: {
            id: existingVote.id,
          },
          data: {
            type: input.voteType,
          },
        });
      }

      return ctx.db.commentVote.create({
        data: {
          type: input.voteType,
          user: {
            connect: {
              id: ctx.session.user.id,
            },
          },
          comment: {
            connect: {
              id: input.commentId,
            },
          },
        },
      });
    }),

  getTopLevelComments: protectedProcedure
    .input(z.object({ postId: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: {
          id: ctx.session.user.id,
        },
        select: {
          package: true,
          admin: true,
        },
      });

      if (!user?.package && !user?.admin) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Du hast hier keinen Zugriff drauf.",
        });
      }

      const { postId } = input;

      return ctx.db.comment.findMany({
        where: {
          post: {
            id: postId,
          },
          replyTo: null,
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          author: {
            select: {
              name: true,
              image: true,
            },
          },
          id: true,
          createdAt: true,
          text: true,
          replyTo: {
            select: {
              id: true,
            },
          },
          replies: {
            select: {
              _count: {
                select: {
                  replies: true,
                },
              },
              text: true,
              createdAt: true,
              id: true,
              author: {
                select: {
                  name: true,
                  image: true,
                },
              },
              votes: {
                select: {
                  user: {
                    select: {
                      id: true,
                    },
                  },
                  type: true,
                },
              },
            },
          },
          votes: {
            select: {
              user: {
                select: {
                  id: true,
                },
              },
              type: true,
            },
          },
        },
      });
    }),

  getReplies: protectedProcedure
    .input(z.object({ replyToId: z.string().nullable() }))
    .query(async ({ ctx, input }) => {
      const { replyToId } = input;
      if (!replyToId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Die ReplyID ist leer",
        });
      }

      const user = await ctx.db.user.findUnique({
        where: {
          id: ctx.session.user.id,
        },
        select: {
          package: true,
          admin: true,
        },
      });

      if (!user?.package && !user?.admin) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Du hast hier keinen Zugriff drauf.",
        });
      }

      return ctx.db.comment.findMany({
        where: {
          replyTo: {
            id: replyToId,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          author: {
            select: {
              name: true,
              image: true,
            },
          },
          id: true,
          createdAt: true,
          text: true,
          replyTo: {
            select: {
              id: true,
            },
          },
          replies: {
            select: {
              _count: {
                select: {
                  replies: true,
                },
              },
              text: true,
              createdAt: true,
              id: true,
              author: {
                select: {
                  name: true,
                  image: true,
                },
              },
              votes: {
                select: {
                  user: {
                    select: {
                      id: true,
                    },
                  },
                  type: true,
                },
              },
            },
          },
          votes: {
            select: {
              user: {
                select: {
                  id: true,
                },
              },
              type: true,
            },
          },
        },
      });
    }),
  /* COMMENTS END */
});
