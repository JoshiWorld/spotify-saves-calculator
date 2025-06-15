import { z } from "zod";
import Pusher from "pusher";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { env } from "@/env";

export const pusher = new Pusher({
    appId: env.PUSHER_APP_ID,
    key: env.PUSHER_KEY,
    secret: env.PUSHER_SECRET,
    cluster: env.PUSHER_CLUSTER,
    useTLS: true,
});

export const chatRouter = createTRPCRouter({
  sendMessage: protectedProcedure.input(z.object({
    message: z.string().min(1).max(255)
  })).mutation(async ({ ctx, input }) => {
    const newMessage = await ctx.db.forumMessage.create({
        data: {
            message: input.message,
            user: {
                connect: {
                    id: ctx.session.user.id
                }
            }
        },
        select: {
          id: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              image: true,
              name: true,
            }
          },
          message: true,
        }
    });

    const chatData = {
      id: newMessage.id,
      message: newMessage.message,
      userName: newMessage.user.name ?? "Unbekannt",
      timestamp: newMessage.createdAt.toISOString(),
      userId: newMessage.user.id,
      image: newMessage.user.image
    };

    await pusher.trigger("forum-chat", "new-message", chatData);

    return chatData;
  }),

  getMessages: protectedProcedure.input(z.object({
    limit: z.number().min(1).max(100).default(50)
  }).optional()).query(async ({ ctx, input }) => {
    const messages = await ctx.db.forumMessage.findMany({
      take: input?.limit,
      orderBy: { createdAt: "desc" },
      select: {
        createdAt: true,
        id: true,
        message: true,
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            package: true,
          }
        }
      }
    });

    return messages.reverse().map(msg => ({
      id: msg.id,
      message: msg.message,
      userName: msg.user.name ?? "Unbekannt",
      timestamp: msg.createdAt.toISOString(),
      userId: msg.user.id,
      image: msg.user.image,
    }));
  })
});
