import { z } from "zod";

import {
  adminProcedure,
  createTRPCRouter,
  publicProcedure,
} from "@/server/api/trpc";

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const blogRouter = createTRPCRouter({
  create: adminProcedure
    .input(
      z.object({
        title: z.string().min(3),
        description: z.string().min(3),
        slug: z.string(),
        image: z.string().nullable(),
      }),
    )
    .mutation(({ ctx, input }) => {
      const slug = slugify(input.slug);

      return ctx.db.blog.create({
        data: {
          title: input.title,
          description: input.description,
          slug,
          image: input.image,
          author: "Joshua von SmartSavvy",
          authorAvatar: "https://assets.aceternity.com/manu.png",
        },
      });
    }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    const blogs = await ctx.db.blog.findMany({
      select: {
        id: true,
        date: true,
        title: true,
        author: true,
        authorAvatar: true,
        description: true,
        slug: true,
        image: true,
      },
    });

    return blogs.map((blog, idx) => ({
      ...blog,
      description:
        idx === 0
          ? blog.description.substring(0, 205)
          : blog.description.substring(0, 85),
    }));
  }),

  get: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.blog.findUnique({
        where: {
          slug: input.slug,
        },
        select: {
          id: true,
          author: true,
          authorAvatar: true,
          title: true,
          description: true,
          date: true,
          image: true,
        },
      });
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(3),
        description: z.string().min(3),
        slug: z.string(),
        image: z.string().nullable(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.blog.update({
        where: {
          id: input.id,
        },
        data: {
          title: input.title,
          description: input.description,
          slug: input.slug,
          image: input.image,
        },
      });
    }),

  delete: adminProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.blog.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
