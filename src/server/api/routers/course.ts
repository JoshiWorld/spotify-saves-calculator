import { z } from "zod";
import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const courseRouter = createTRPCRouter({
  /* COURSE START */
  createCourse: adminProcedure
    .input(
      z.object({
        internalName: z.string(),
        title: z.string(),
        description: z.string().optional(),
        thumbnail: z.string(),
      }),
    )
    .mutation(({ ctx, input }) => {
      const { internalName, title, description, thumbnail } = input;

      return ctx.db.course.create({
        data: {
          internalName,
          title,
          description,
          thumbnail,
        },
      });
    }),

  updateCourse: adminProcedure
    .input(
      z.object({
        id: z.string(),
        internalName: z.string(),
        title: z.string(),
        description: z.string().optional(),
        thumbnail: z.string(),
      }),
    )
    .mutation(({ ctx, input }) => {
      const { id, internalName, title, description, thumbnail } = input;

      return ctx.db.course.update({
        where: {
          id,
        },
        data: {
          internalName,
          title,
          description,
          thumbnail,
        },
      });
    }),

  deleteCourse: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.db.course.delete({
        where: {
          id: input.id,
        },
      });
    }),

  getCourse: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: {
          id: ctx.session.user.id,
        },
        select: {
          courses: {
            select: {
              id: true,
            },
          },
        },
      });

      if (!user?.courses.some((course) => course.id === input.id)) {
        throw new TRPCError({
          message: "Du hast hier keinen Zugriff",
          code: "UNAUTHORIZED",
        });
      }

      return ctx.db.course.findUnique({
        where: {
          id: input.id,
        },
        select: {
          id: true,
          thumbnail: true,
          title: true,
          description: true,
          sections: {
            select: {
              id: true,
              title: true,
              videos: {
                select: {
                  id: true,
                  thumbnail: true,
                  description: true,
                  title: true,
                  videoLink: true,
                  usersWatched: {
                    where: {
                      id: ctx.session.user.id,
                    },
                    select: {
                      id: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    }),

  getCourses: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: {
        id: ctx.session.user.id,
      },
      select: {
        courses: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!user) {
      throw new TRPCError({
        message: "Du hast hier keinen Zugriff",
        code: "UNAUTHORIZED",
      });
    }

    const courseIds = user.courses.map((course) => course.id);

    return ctx.db.course.findMany({
      where: {
        id: {
          in: courseIds,
        },
      },
      select: {
        id: true,
        _count: {
          select: {
            sections: true,
          },
        },
        title: true,
        description: true,
        thumbnail: true,
      },
    });
  }),
  /* COURSE END */

  /* SECTIONS START */
  createSection: adminProcedure
    .input(
      z.object({
        title: z.string(),
        courseId: z.string(),
      }),
    )
    .mutation(({ ctx, input }) => {
      const { title, courseId } = input;

      return ctx.db.courseSection.create({
        data: {
          title,
          course: {
            connect: {
              id: courseId,
            },
          },
        },
      });
    }),

  updateSection: adminProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string(),
      }),
    )
    .mutation(({ ctx, input }) => {
      const { id, title } = input;

      return ctx.db.courseSection.update({
        where: {
          id,
        },
        data: {
          title,
        },
      });
    }),

  deleteSection: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.db.courseSection.delete({
        where: {
          id: input.id,
        },
      });
    }),
  /* SECTIONS END */

  /* VIDEOS START */
  createVideo: adminProcedure
    .input(
      z.object({
        title: z.string(),
        sectionId: z.string(),
        description: z.string().optional(),
        thumbnail: z.string(),
        videoLink: z.string(),
      }),
    )
    .mutation(({ ctx, input }) => {
      const { title, sectionId, description, thumbnail, videoLink } = input;

      return ctx.db.courseVideo.create({
        data: {
          title,
          section: {
            connect: {
              id: sectionId,
            },
          },
          description,
          thumbnail,
          videoLink,
        },
      });
    }),

  updateVideo: adminProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string(),
        sectionId: z.string(),
        description: z.string().optional(),
        thumbnail: z.string(),
        videoLink: z.string(),
      }),
    )
    .mutation(({ ctx, input }) => {
      const { id, title, sectionId, description, thumbnail, videoLink } = input;

      return ctx.db.courseVideo.update({
        where: {
          id,
        },
        data: {
          title,
          section: {
            connect: {
                id: sectionId
            }
          },
          description,
          thumbnail,
          videoLink
        },
      });
    }),

  deleteVideo: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.db.courseVideo.delete({
        where: {
          id: input.id,
        },
      });
    }),
  /* VIDEOS END */
});
