import { z } from "zod";

import {
    artistProcedure,
    createTRPCRouter,
} from "@/server/api/trpc";
import { env } from "@/env";
import { Redis } from "@upstash/redis";
import { subDays } from "date-fns";
import { db } from "@/server/db";

const redis = new Redis({
    url: env.KV_REST_API_URL,
    token: env.KV_REST_API_TOKEN,
});

type SpotifyPlaylistFollower = {
    followers: {
        href: string | null;
        total: number;
    }
}

type TokenResponse = {
    access_token: string;
    token_type: string;
    scope: string;
    expires_in: number;
    refresh_token: string;
};

export const playlistAnalyseRouter = createTRPCRouter({
    create: artistProcedure
        .input(
            z.object({
                name: z.string().min(3),
                playlistLink: z.string(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const playlistId = convertPlaylistlinkToID(input.playlistLink);
            const playlist = await ctx.db.playlistAnalyse.create({
                data: {
                    name: input.name,
                    playlistId,
                    user: {
                        connect: {
                            id: ctx.session.user.id
                        }
                    }
                },
                select: {
                    id: true,
                    playlistId: true,
                    user: {
                        select: {
                            id: true,
                        }
                    }
                }
            });

            const token = await refreshToken();

            const spotifyReq = await fetch(`https://api.spotify.com/v1/playlists/${playlist.playlistId}?fields=followers`, {
                method: "GET",
                headers: {
                    "content-type": "application/json",
                    Authorization: `${token.tokenType} ${token.accessToken}`,
                },
            });
            const data: SpotifyPlaylistFollower = await spotifyReq.json() as SpotifyPlaylistFollower;

            await updateRedis(playlist.user.id, playlist.id, data.followers.total);

            return {
                success: true,
            };
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

    delete: artistProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
        const playlist = await ctx.db.playlistAnalyse.delete({
            where: {
                user: {
                    id: ctx.session.user.id
                },
                id: input.id
            },
            select: {
                id: true,
                user: {
                    select: {
                        id: true,
                    }
                }
            }
        });

        await deleteAllPlaylistStats(playlist.user.id, playlist.id);

        return {
            success: true,
        }
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
    }),

    getAllStats: artistProcedure
        .input(z.object({ days: z.number() }))
        .query(async ({ ctx, input }) => {
            const { days } = input;
            const endDate = new Date();
            const startDate = subDays(endDate, days);
            const startDateBefore = subDays(startDate, days);

            try {
                const keyPattern = `playlist:analyse:${ctx.session.user.id}:*:*`;
                const allKeys = await redis.keys(keyPattern);

                const playlistIds = [
                    ...new Set(
                        allKeys.map((key) => key.split(":")[3])
                    ),
                ];

                if (!playlistIds || playlistIds.length === 0) {
                    return {
                        follows: 0,
                        gained: 0,
                        lost: 0,
                        followsBefore: 0,
                        gainedBefore: 0,
                        lostBefore: 0,
                    };
                }

                const getAggregatedStatsForPlaylist = async (
                    playlistId: string,
                    startDate: Date,
                    endDate: Date,
                ) => {
                    const keyPattern = `playlist:analyse:${ctx.session.user.id}:${playlistId}:*`;
                    const allKeys = await redis.keys(keyPattern);

                    if (!allKeys || allKeys.length === 0) {
                        return { follows: 0, gained: 0, lost: 0 };
                    }

                    const relevantKeys = allKeys.filter((key) => {
                        const dateString = key.split(":")[4];
                        const keyDate = new Date(dateString!);
                        return keyDate >= startDate && keyDate <= endDate;
                    });

                    let totalFollows = 0;
                    let totalGained = 0;
                    let totalLost = 0;

                    for (const key of relevantKeys) {
                        try {
                            const data = await redis.hgetall<{
                                follows: string;
                                gained: string;
                                lost: string;
                            }>(key);

                            if (data) {
                                totalFollows += Number(data.follows) || 0;
                                totalGained += Number(data.gained) || 0;
                                totalLost += Number(data.lost) || 0;
                            }
                        } catch (parseError) {
                            console.error(
                                `Fehler beim Abrufen der Daten für Schlüssel ${key}:`,
                                parseError
                            );
                        }
                    }

                    return {
                        follows: totalFollows,
                        gained: totalGained,
                        lost: totalLost,
                    };
                };

                let totalFollows = 0;
                let totalGained = 0;
                let totalLost = 0;
                let totalFollowsBefore = 0;
                let totalGainedBefore = 0;
                let totalLostBefore = 0;

                for (const playlistId of playlistIds) {
                    const currentStats = await getAggregatedStatsForPlaylist(
                        // @ts-expect-error || @ts-ignore
                        playlistId,
                        startDate,
                        endDate
                    );
                    totalFollows += currentStats.follows;
                    totalGained += currentStats.gained;
                    totalLost += currentStats.lost;

                    const previousStats = await getAggregatedStatsForPlaylist(
                        // @ts-expect-error || @ts-ignore
                        playlistId,
                        startDateBefore,
                        startDate
                    );
                    totalFollowsBefore += previousStats.follows;
                    totalGainedBefore += previousStats.gained;
                    totalLostBefore += previousStats.lost;
                }

                return {
                    follows: totalFollows,
                    gained: totalGained,
                    lost: totalLost,
                    followsBefore: totalFollowsBefore,
                    gainedBefore: totalGainedBefore,
                    lostBefore: totalLostBefore,
                };
            } catch (error) {
                console.error("Fehler beim Abrufen der Daten aus Redis:", error);
                return {
                    follows: 0,
                    gained: 0,
                    lost: 0,
                    followsBefore: 0,
                    gainedBefore: 0,
                    lostBefore: 0,
                };
            }
        }),
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

async function deleteAllPlaylistStats(userId: string, id: string) {
    try {
        const keyPattern = `playlist:analyse:${userId}:${id}:*`;

        const keys = await redis.keys(keyPattern);

        if (keys.length === 0) {
            console.log(`Keine Einträge für Playlist ${id} gefunden.`);
            return;
        }

        await redis.del(...keys);

        console.log(`Alle Einträge für Playlist ${id} gelöscht.`);
    } catch (error) {
        console.error("Fehler beim Löschen der Playlist-Einträge:", error);
    }
}



const refreshToken = async () => {
    const spotify = await db.dataSaves.findUnique({
        where: {
            name: "spotify",
        },
        select: {
            refreshToken: true,
        },
    });

    const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            "content-type": "application/x-www-form-urlencoded",
            Authorization:
                "Basic " +
                Buffer.from(
                    env.SPOTIFY_CLIENT_ID + ":" + env.SPOTIFY_CLIENT_SECRET,
                ).toString("base64"),
        },
        body: new URLSearchParams({
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            refresh_token: spotify!.refreshToken!,
            client_id: env.SPOTIFY_CLIENT_ID,
            grant_type: "refresh_token",
        }).toString(),
    });
    if (!response.ok) {
        throw new Error("Spotify Token could not be fetched");
    }

    const result = (await response.json()) as TokenResponse;
    await db.dataSaves.update({
        where: {
            name: "spotify",
        },
        data: {
            accessToken: result.access_token,
            refreshToken: result.refresh_token,
            expiresIn: result.expires_in,
            scope: result.scope,
            tokenType: result.token_type,
        },
    });

    return {
        message: "Token erfolgreich aktualisiert",
        accessToken: result.access_token,
        tokenType: result.token_type
    };
};