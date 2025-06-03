import { z } from "zod";

import {
  adminProcedure,
  createTRPCRouter,
  digistoreProcedure,
  protectedProcedure,
} from "@/server/api/trpc";
import { Package } from "@prisma/client";
import { TRPCError } from "@trpc/server";

export const userRouter = createTRPCRouter({
  update: protectedProcedure
    .input(
      z.object({
        goodCPS: z.number(),
        name: z.string(),
        // image: z.string(),
        midCPS: z.number(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          goodCPS: input.goodCPS,
          midCPS: input.midCPS,
          name: input.name,
          // image: input.image,
        },
      });
    }),

  updateProfilePicture: protectedProcedure
    .input(z.object({ image: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.db.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          image: input.image,
        },
      });
    }),

  removeMetaAccess: protectedProcedure.mutation(({ ctx }) => {
    return ctx.db.user.update({
      where: {
        id: ctx.session.user.id,
      },
      data: {
        metaAccessToken: null,
      },
    });
  }),

  get: protectedProcedure.query(({ ctx }) => {
    return ctx.db.user.findUnique({
      where: {
        id: ctx.session.user.id,
      },
      select: {
        id: true,
        admin: true,
        package: true,
        name: true,
      },
    });
  }),

  getMetaToken: protectedProcedure.query(({ ctx }) => {
    return ctx.db.user.findUnique({
      where: {
        id: ctx.session.user.id,
      },
      select: {
        metaAccessToken: true,
      },
    });
  }),

  getCPS: protectedProcedure.query(({ ctx }) => {
    return ctx.db.user.findUnique({
      where: {
        id: ctx.session.user.id,
      },
      select: {
        midCPS: true,
        goodCPS: true,
      },
    });
  }),

  getSettings: protectedProcedure.query(({ ctx }) => {
    return ctx.db.user.findUnique({
      where: {
        id: ctx.session.user.id,
      },
    });
  }),

  delete: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: {
        id: ctx.session.user.id,
      },
      select: {
        package: true,
      },
    });
    if (user?.package) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "User has to cancel subscription first",
      });
    }
    return ctx.db.user.delete({
      where: {
        id: ctx.session.user.id,
      },
    });
  }),

  // ADMIN STUFF
  getAll: adminProcedure.query(({ ctx }) => {
    return ctx.db.user.findMany({
      select: {
        id: true,
        name: true,
        package: true,
        email: true,
        emailVerified: true,
      },
    });
  }),
  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.user.findUnique({
        where: {
          id: input.id,
        },
      });
    }),
  updateById: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        email: z.string(),
        package: z.nativeEnum(Package),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.user.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          email: input.email,
          package: input.package,
        },
      });
    }),

  // // AUTOMATIONS
  // updateSubscription: publicProcedure
  //   .input(
  //     z.object({
  //       email: z.string(),
  //       productName: z.string().nullable().optional(),
  //       body: z.string(),
  //       signature: z.string().nullable(),
  //     }),
  //   )
  //   .mutation(({ ctx, input }) => {
  //     if (!verifyCopeCartSignature(input.body, input.signature)) {
  //       return null;
  //     }

  //     let product: Package | null = null;

  //     switch (input.productName) {
  //       case "smartsavvy_starter":
  //         product = Package.STARTER;
  //         break;
  //       case "smartsavvy_artist":
  //         product = Package.ARTIST;
  //         break;
  //       case "smartsavvy_label":
  //         product = Package.LABEL;
  //         break;
  //       default:
  //         product = null;
  //     }

  //     return ctx.db.user.update({
  //       where: {
  //         email: input.email,
  //       },
  //       data: {
  //         package: product,
  //       },
  //     });
  //   }),

  // Digistore Subscription
  updateSubscriptionDigistore: digistoreProcedure
    .input(
      z.object({
        email: z.string(),
        productName: z.string().optional(),
        name: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      let product: Package | null = null;

      switch (input.productName) {
        case "595197":
          product = Package.STARTER;
          break;
        case "589929":
          product = Package.ARTIST;
          break;
        case "595198":
          product = Package.LABEL;
          break;
        default:
          product = null;
      }

      let user = await ctx.db.user.findUnique({
        where: {
          email: input.email,
        },
        select: {
          id: true,
        },
      });

      const updatedData = {
        email: input.email,
        package: product,
        emailVerified: new Date(),
        ...(input.name && { name: input.name }),
      };

      user ??= await ctx.db.user.create({
        data: updatedData,
        select: {
          id: true,
        }
      });

      if (input.productName && !product) {
        const course = await ctx.db.course.findUnique({
          where: {
            internalName: input.productName
          },
          select: {
            id: true,
          }
        });

        if (!course) {
          throw new TRPCError({
            message: `Produkt konnte nicht gefunden werden (${input.productName})`,
            code: "BAD_REQUEST",
          });
        }

        return ctx.db.courseToUsers.create({
          data: {
            user: {
              connect: {
                id: user.id
              }
            },
            course: {
              connect: {
                id: course?.id
              }
            }
          }
        });
      }

      return ctx.db.user.update({
        where: {
          email: input.email,
        },
        data: {
          name: input.name,
          package: product,
        },
      });
    }),

  addCourse: digistoreProcedure
    .input(
      z.object({
        email: z.string(),
        courseInternalName: z.string(),
        name: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: {
          email: input.email,
        },
        select: {
          id: true,
        },
      });

      let userId;

      if (!user) {
        const createdUser = await ctx.db.user.create({
          data: {
            email: input.email,
            name: input.name,
            emailVerified: new Date(),
          },
          select: {
            id: true,
          },
        });

        userId = createdUser.id;
      } else {
        userId = user.id;
      }

      const course = await ctx.db.course.findUnique({
        where: {
          internalName: input.courseInternalName,
        },
        select: {
          id: true,
        },
      });

      if (!course) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course not found",
        });
      }

      return ctx.db.courseToUsers.create({
        data: {
          user: {
            connect: {
              id: userId,
            },
          },
          course: {
            connect: {
              id: course.id,
            },
          },
        },
      });
    }),

  removeCourse: digistoreProcedure.input(
    z.object({
      email: z.string(),
      courseInternalName: z.string(),
    })
  ).mutation(async ({ ctx, input }) => {
    const user = await ctx.db.user.findUnique({
      where: {
        email: input.email,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    const course = await ctx.db.course.findUnique({
      where: {
        internalName: input.courseInternalName,
      },
      select: {
        id: true,
      },
    });

    if (!course) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Course not found",
      });
    }

    return ctx.db.courseToUsers.deleteMany({
      where: {
        userId: user.id,
        courseId: course.id,
      },
    });
  })
});
