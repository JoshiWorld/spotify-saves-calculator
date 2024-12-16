import { z } from "zod";

import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { Package } from "@prisma/client";
import { verifyCopeCartSignature } from "@/lib/copecart";

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
    });
  }),

  delete: protectedProcedure.mutation(({ ctx }) => {
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
        package: z.string().nullable(),
      }),
    )
    .mutation(({ ctx, input }) => {
      let product: Package | null = null;

      switch (input.package) {
        case "STARTER":
          product = Package.STARTER;
          break;
        case "ARTIST":
          product = Package.ARTIST;
          break;
        case "LABEL":
          product = Package.LABEL;
          break;
        default:
          product = null;
      }

      return ctx.db.user.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          email: input.email,
          package: product,
        },
      });
    }),

  // AUTOMATIONS
  updateSubscription: publicProcedure
    .input(
      z.object({
        email: z.string(),
        productName: z.string().nullable().optional(),
        body: z.string(),
        signature: z.string().nullable(),
      }),
    )
    .mutation(({ ctx, input }) => {
      if (!verifyCopeCartSignature(input.body, input.signature)) {
        return null;
      }

      let product: Package | null = null;

      switch (input.productName) {
        case "smartsavvy_starter":
          product = Package.STARTER;
          break;
        case "smartsavvy_artist":
          product = Package.ARTIST;
          break;
        case "smartsavvy_label":
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
          package: product,
        },
      });
    }),
});
