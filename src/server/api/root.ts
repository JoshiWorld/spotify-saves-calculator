import { postRouter } from "@/server/api/routers/post";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { campaignRouter } from "./routers/campaign";
import { projectRouter } from "./routers/project";
import { userRouter } from "./routers/user";
import { metaRouter } from "./routers/meta";
import { linkRouter } from "./routers/link";
import { linkstatsRouter } from "./routers/linkstats";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  campaign: campaignRouter,
  project: projectRouter,
  user: userRouter,
  meta: metaRouter,
  link: linkRouter,
  linkstats: linkstatsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
