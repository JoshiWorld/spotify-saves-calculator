import { z } from "zod";

import {
  adminProcedure,
  createTRPCRouter,
  digistoreProcedure,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { Package } from "@prisma/client";
import { verifyCopeCartSignature } from "@/lib/copecart";
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
        admin: true,
        package: true,
        name: true,
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
        productName: z.string().nullable().optional(),
        name: z.string(),
      }),
    )
    .mutation(({ ctx, input }) => {
      ctx.headers.forEach((value, key) => {
        console.log('CTX-HEADER: ', key + ': ' + value);
      })
      let product: Package | null = null;

      switch (input.productName) {
        case "SmartSavvy Starter":
          product = Package.STARTER;
          break;
        case "589929":
          product = Package.ARTIST;
          break;
        case "SmartSavvy Label":
          product = Package.LABEL;
          break;
        default:
          product = null;
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
});
