import { z } from "zod";

import {
    artistProcedure,
    createTRPCRouter,
} from "@/server/api/trpc";
import { env } from "@/env";
import { Redis } from "@upstash/redis";

const redis = new Redis({
    url: env.KV_REST_API_URL,
    token: env.KV_REST_API_TOKEN,
});

export const playlistAnalyseRouter = createTRPCRouter({
    create: artistProcedure
        .input(
            z.object({
                name: z.string().min(3),
                playlistLink: z.string(),
            }),
        )
        .mutation(({ ctx, input }) => {
            const playlistId = convertPlaylistlinkToID(input.playlistLink);
            return ctx.db.playlistAnalyse.create({
                data: {
                    name: input.name,
                    playlistId,
                    user: {
                        connect: {
                            id: ctx.session.user.id
                        }
                    }
                }
            });
        }),

    update: artistProcedure.input(z.object({ id: z.string(), name: z.string().min(3) })).mutation(({ ctx, input }) => {
        return ctx.db.playlistAnalyse.update({
            where: {
                id: input.id
            },
            data: {
                name: input.name
            }
        });
    }),

    getAll: artistProcedure.query(({ ctx }) => {
        return ctx.db.playlistAnalyse.findMany({
            where: {
                user: {
                    id: ctx.session.user.id
                }
            },
            select: {
                id: true,
                name: true,
                playlistId: true,
            }
        });
    }),

    get: artistProcedure.input(z.object({ id: z.string() })).query(({ ctx, input }) => {
        return ctx.db.playlistAnalyse.findUnique({
            where: {
                user: {
                    id: ctx.session.user.id
                },
                id: input.id
            },
            select: {
                id: true,
                name: true,
                playlistId: true,
            }
        });
    }),

    delete: artistProcedure.input(z.object({ id: z.string() })).mutation(({ ctx, input }) => {
        return ctx.db.playlistAnalyse.delete({
            where: {
                user: {
                    id: ctx.session.user.id
                },
                id: input.id
            },
        });
    }),



    /* STATS */
    getStats: artistProcedure.input(z.object({ id: z.string(), days: z.number() })).query(async ({ ctx, input }) => {
        try {
            let dates: string[] = [];

            if (input.days === 0) {
                const keys = await redis.keys(`playlist:analyse:${ctx.session.user.id}:${input.id}:*`);
                dates = keys.map((key) => key.split(":").pop() ?? "");
            } else {
                const today = new Date();
                for (let i = 0; i < input.days; i++) {
                    const date = new Date(today);
                    date.setDate(today.getDate() - i);
                    // @ts-expect-error || @ts-ignore
                    dates.push(date.toISOString().split("T")[0]);
                }
            }

            const stats = await Promise.all(
                dates.map(async (date) => {
                    const redisKey = `playlist:analyse:${ctx.session.user.id}:${input.id}:${date}`;
                    const data = await redis.hgetall<{
                        follows: string;
                        gained: string;
                        lost: string;
                    }>(redisKey);

                    if (data) {
                        return {
                            date,
                            follows: parseInt(data.follows, 10),
                            gained: parseInt(data.gained, 10),
                            lost: parseInt(data.lost, 10),
                        };
                    } else {
                        return {
                            date,
                            follows: 0,
                            gained: 0,
                            lost: 0,
                        };
                    }
                })
            );

            return stats;
        } catch (error) {
            console.error("Fehler beim Abrufen der Statistiken:", error);
            throw new Error("Fehler beim Abrufen der Statistiken");
        }
    })
});


function convertPlaylistlinkToID(link: string): string {
    const trackIdMatch =
        /playlist\/([a-zA-Z0-9]+)/.exec(link) ??
        /playlist\/([a-zA-Z0-9]+)\?/.exec(link);
    if (trackIdMatch?.[1]) {
        return trackIdMatch[1];
    } else {
        throw new Error("Ungültiger Spotify-Link");
    }
}

async function updateRedis(userId: string, id: string, currentFollows: number) {
    const dateKey = new Date().toISOString().split("T")[0];
    const redisKey = `playlist:analyse:${userId}:${id}:${dateKey}`;

    try {
        const existingData = await redis.hgetall<{
            follows: string;
            gained: string;
            lost: string;
        }>(redisKey);

        if (!existingData) {
            await redis.hset(redisKey, {
                follows: currentFollows,
                gained: 0,
                lost: 0,
            });
            console.log(`Erster Eintrag für ${redisKey} erstellt.`);
            return;
        }

        const previousFollows = parseInt(existingData.follows, 10);
        const gained = parseInt(existingData.gained, 10);
        const lost = parseInt(existingData.lost, 10);

        const followDifference = currentFollows - previousFollows;

        let newGained = gained;
        let newLost = lost;

        if (followDifference > 0) {
            newGained += followDifference;
        } else if (followDifference < 0) {
            newLost -= followDifference;
        }

        await redis.hset(redisKey, {
            follows: currentFollows,
            gained: newGained,
            lost: newLost,
        });

        // console.log(
        //     `Daten für ${redisKey} aktualisiert: follows=${currentFollows}, gained=${newGained}, lost=${newLost}`
        // );
    } catch (error) {
        console.error("Fehler beim Aktualisieren von Redis:", error);
    }
}