import { z } from "zod";

import {
    artistProcedure,
    createTRPCRouter,
} from "@/server/api/trpc";
import { env } from "@/env";
import { Redis } from "@upstash/redis";
import { eachDayOfInterval, format, subDays } from "date-fns";
import { db } from "@/server/db";
import { TRPCError } from "@trpc/server";

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

    getPlaylistName: artistProcedure.input(z.object({ id: z.string() })).query(({ ctx, input }) => {
        return ctx.db.playlistAnalyse.findUnique({
            where: {
                user: {
                    id: ctx.session.user.id
                },
                id: input.id
            },
            select: {
                name: true,
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
            const datesBefore: string[] = [];

            if (input.days === 0) {
                const keys = await redis.keys(`playlist:analyse:${ctx.session.user.id}:${input.id}:*`);
                dates = keys.map((key) => key.split(":").pop() ?? "");
            } else {
                const today = new Date();
                for (let i = 0; i < input.days; i++) {
                    const date = new Date(today);
                    const dateBefore = new Date(today);
                    date.setDate(today.getDate() - i);
                    dateBefore.setDate(today.getDate() - (i + input.days));

                    // @ts-expect-error || @ts-ignore
                    dates.push(date.toISOString().split("T")[0]);
                    // @ts-expect-error || @ts-ignore
                    datesBefore.push(dateBefore.toISOString().split("T")[0]);
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

            const statsBefore = await Promise.all(
                datesBefore.map(async (date) => {
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

            return {
                stats: stats.reverse(),
                statsBefore: statsBefore.reverse()
            };
        } catch (error) {
            console.error("Fehler beim Abrufen der Statistiken:", error);
            throw new Error("Fehler beim Abrufen der Statistiken");
        }
    }),

    getStatsDifference: artistProcedure
        .input(z.object({ id: z.string(), days: z.number() }))
        .query(async ({ ctx, input }) => {
            const { days } = input;
            const endDate = new Date();
            const startDate = subDays(endDate, days);
            const startDateBefore = subDays(startDate, days);

            try {
                const getAggregatedStatsForPlaylist = async (
                    playlistId: string,
                    startDate: Date,
                    endDate: Date
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

                    let totalGained = 0;
                    let totalLost = 0;
                    let lastFollows = 0;

                    relevantKeys.sort((a, b) => {
                        const dateA = new Date(a.split(":")[4]!);
                        const dateB = new Date(b.split(":")[4]!);
                        return dateA.getTime() - dateB.getTime();
                    });

                    for (const key of relevantKeys) {
                        try {
                            const data = await redis.hgetall<{
                                follows: string;
                                gained: string;
                                lost: string;
                            }>(key);

                            if (data) {
                                totalGained += Number(data.gained) || 0;
                                totalLost += Number(data.lost) || 0;
                                lastFollows = Number(data.follows) || 0;
                            }
                        } catch (parseError) {
                            console.error(
                                `Fehler beim Abrufen der Daten für Schlüssel ${key}:`,
                                parseError
                            );
                        }
                    }

                    return {
                        follows: lastFollows,
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

                const currentStats = await getAggregatedStatsForPlaylist(
                    input.id,
                    startDate,
                    endDate
                );
                totalFollows += currentStats.follows;
                totalGained += currentStats.gained;
                totalLost += currentStats.lost;

                const previousStats = await getAggregatedStatsForPlaylist(
                    input.id,
                    startDateBefore,
                    startDate
                );
                totalFollowsBefore += previousStats.follows;
                totalGainedBefore += previousStats.gained;
                totalLostBefore += previousStats.lost;

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
                    endDate: Date
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

                    let totalGained = 0;
                    let totalLost = 0;
                    let lastFollows = 0;

                    relevantKeys.sort((a, b) => {
                        const dateA = new Date(a.split(":")[4]!);
                        const dateB = new Date(b.split(":")[4]!);
                        return dateA.getTime() - dateB.getTime();
                    });

                    for (const key of relevantKeys) {
                        try {
                            const data = await redis.hgetall<{
                                follows: string;
                                gained: string;
                                lost: string;
                            }>(key);

                            if (data) {
                                totalGained += Number(data.gained) || 0;
                                totalLost += Number(data.lost) || 0;
                                lastFollows = Number(data.follows) || 0;
                            }
                        } catch (parseError) {
                            console.error(
                                `Fehler beim Abrufen der Daten für Schlüssel ${key}:`,
                                parseError
                            );
                        }
                    }

                    return {
                        follows: lastFollows,
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

    getAggregatedStatsForUserWithComparison: artistProcedure
        .input(z.object({ days: z.number() }))
        .query(async ({ ctx, input }) => {
            const { days } = input;
            const endDate = new Date();
            const startDate = subDays(endDate, days);
            const startDateBefore = subDays(startDate, days);

            try {
                const playlists = await ctx.db.playlistAnalyse.findMany({
                    where: {
                        user: {
                            id: ctx.session.user.id,
                        },
                    },
                    select: {
                        id: true,
                    },
                });

                const playlistIds = playlists.map((link) => link.id);

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
                    const playlist = await ctx.db.playlistAnalyse.findUnique({
                        where: {
                            id: playlistId,
                        },
                        select: {
                            id: true,
                        },
                    });
                    if (!playlist) throw Error("Playlist not found");

                    const keyPattern = `playlist:analyse:${ctx.session.user.id}:${playlist.id}:*`;
                    const allKeys = await redis.keys(keyPattern);

                    if (!allKeys || allKeys.length === 0) {
                        return { gained: 0, lost: 0, latestFollows: 0 };
                    }

                    const relevantKeys = allKeys.filter((key) => {
                        const dateString = key.split(":")[4];
                        const keyDate = new Date(dateString!);
                        return keyDate >= startDate && keyDate <= endDate;
                    });

                    let totalGained = 0;
                    let totalLost = 0;
                    let latestFollows = 0;

                    for (let i = 0; i < relevantKeys.length; i++) {
                        const key = relevantKeys[i];
                        try {
                            const data = await redis.hgetall(key!);

                            if (data) {
                                totalGained += Number(data.gained) || 0;
                                totalLost += Number(data.lost) || 0;

                                if (i === relevantKeys.length - 1) {
                                    latestFollows = Number(data.follows) || 0;
                                }
                            }
                        } catch (parseError) {
                            console.error(
                                `Fehler beim Abrufen der Daten für Schlüssel ${key}:`,
                                parseError,
                            );
                        }
                    }

                    return { gained: totalGained, lost: totalLost, latestFollows };
                };

                let totalGained = 0;
                let totalLost = 0;
                let totalGainedBefore = 0;
                let totalLostBefore = 0;
                let newestFollows = 0;
                let newestFollowsBefore = 0;

                for (const playlistId of playlistIds) {
                    const currentStats = await getAggregatedStatsForPlaylist(
                        playlistId,
                        startDate,
                        endDate,
                    );
                    totalGained += currentStats.gained;
                    totalLost += currentStats.lost;
                    newestFollows = currentStats.latestFollows;

                    const previousStats = await getAggregatedStatsForPlaylist(
                        playlistId,
                        startDateBefore,
                        startDate,
                    );
                    totalGainedBefore += previousStats.gained;
                    totalLostBefore += previousStats.lost;
                    newestFollowsBefore = previousStats.latestFollows;
                }

                return {
                    follows: newestFollows,
                    gained: totalGained,
                    lost: totalLost,
                    followsBefore: newestFollowsBefore,
                    gainedBefore: totalGainedBefore,
                    lostBefore: totalLostBefore,
                }
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

    getOverviewChart: artistProcedure
        .query(async ({ ctx }) => {
            const playlists = await ctx.db.playlistAnalyse.findMany({
                where: {
                    user: {
                        id: ctx.session.user.id
                    }
                },
                select: {
                    id: true
                }
            });

            const today = new Date();
            const keyPatterns: string[] = [];
            for (let i = 0; i < 90; i++) {
                const date = new Date();
                date.setDate(today.getDate() - i);
                const dateString = date.toISOString().split("T")[0];

                for (const playlist of playlists) {
                    keyPatterns.push(`playlist:analyse:${ctx.session.user.id}:${playlist.id}:${dateString}`);
                }
            }

            try {
                const pipeline = redis.pipeline();
                for (const pattern of keyPatterns) {
                    pipeline.scan(0, { match: pattern, count: 1000 });
                }

                // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
                const results = (await pipeline.exec()) as [number, string[]][];
                const allKeys = results
                    .map(([, keys]) => keys)
                    .flat()
                    .filter((key) => key);

                if (allKeys.length === 0) {
                    const emptyData = [];
                    for (let i = 89; i >= 0; i--) {
                        const date = new Date();
                        date.setDate(date.getDate() - i);
                        emptyData.push({
                            date: date.toISOString().split("T")[0],
                            follows: 0,
                        });
                    }
                    return emptyData;
                }

                const dailyFollows = await Promise.all(
                    allKeys.map(async (key) => {
                        const currentKeyDate = key.split(":")[4] ?? new Date().toISOString().split("T")[0];

                        try {
                            const data = await redis.hgetall(key);

                            if (data) {
                                const follows = Number(data.follows) || 0;

                                return { date: new Date(currentKeyDate!), follows };
                            } else {
                                return { date: new Date(currentKeyDate!), follows: 0 };
                            }
                        } catch (error) {
                            console.error(
                                `Fehler beim Abrufen der Daten für Schlüssel ${key}:`,
                                error,
                            );
                            return { date: new Date(currentKeyDate!), follows: 0 }; // Standardwert bei Fehler
                        }
                    }),
                );

                const finalAggregatedFollows = aggregateFollows(dailyFollows);

                // const sortedDailyConversionRates = finalAggregatedRates.sort(
                //   (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
                // );

                const dataMap = new Map(
                    finalAggregatedFollows.map((item) => [
                        item.date.toISOString().split("T")[0],
                        item,
                    ]),
                );

                const fullDateRange = [];
                for (let i = 89; i >= 0; i--) {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    const dateString = date.toISOString().split("T")[0];

                    if (dataMap.has(dateString)) {
                        const existingData = dataMap.get(dateString)!;
                        fullDateRange.push({
                            date: dateString,
                            follows: existingData.follows,
                        });
                    } else {
                        fullDateRange.push({
                            date: dateString,
                            follows: 0,
                        });
                    }
                }
                return fullDateRange;

                // return sortedDailyConversionRates.map(item => ({
                //   ...item,
                //   date: item.date.toISOString().split("T")[0]
                // }));
            } catch (error) {
                console.error("Fehler beim Abrufen der Daten aus Redis:", error);
                return [];
            }
        }),

    getRange: artistProcedure
        .input(z.object({ playlistId: z.string(), days: z.number() }))
        .query(async ({ ctx, input }) => {
            const { playlistId, days } = input;
            const playlist = await ctx.db.playlistAnalyse.findUnique({
                where: {
                    id: playlistId,
                },
                select: {
                    id: true,
                },
            });
            if (!playlist) throw new TRPCError({ message: "Playlist not found", code: "BAD_REQUEST" });

            const endDate = new Date();
            const startDate = subDays(endDate, days);
            const startDateBefore = subDays(startDate, days);

            try {
                const getAggregatedStats = async (startDate: Date, endDate: Date) => {
                    const keyPattern = `playlist:analyse:${ctx.session.user.id}:${playlist.id}:*`;
                    const allKeys = await redis.keys(keyPattern);

                    if (!allKeys || allKeys.length === 0) {
                        return { latestFollows: 0, gained: 0, lost: 0 };
                    }

                    const relevantKeys = allKeys.filter((key) => {
                        const dateString = key.split(":")[4];
                        const keyDate = new Date(dateString!);
                        return keyDate >= startDate && keyDate <= endDate;
                    });

                    let totalGained = 0;
                    let totalLost = 0;
                    let latestFollows = 0;

                    for (let i = 0; i < relevantKeys.length; i++) {
                        const key = relevantKeys[i];
                        try {
                            const data = await redis.hgetall(key!);

                            if (data) {
                                totalGained += Number(data.gained) || 0;
                                totalLost += Number(data.lost) || 0;

                                if (i === relevantKeys.length - 1) {
                                    latestFollows = Number(data.follows) || 0;
                                }
                            }
                        } catch (parseError) {
                            console.error(
                                `Fehler beim Abrufen der Daten für Schlüssel ${key}:`,
                                parseError,
                            );
                        }
                    }

                    return { gained: totalGained, lost: totalLost, latestFollows };
                };

                const currentStats = await getAggregatedStats(startDate, endDate);

                const previousStats = await getAggregatedStats(
                    startDateBefore,
                    startDate,
                );

                return {
                    follows: currentStats.latestFollows,
                    gained: currentStats.gained,
                    lost: currentStats.lost,
                    followsBefore: previousStats.latestFollows,
                    gainedBefore: previousStats.gained,
                    lostBefore: previousStats.lost,
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

    getDailyFollows: artistProcedure
        .input(z.object({ playlistId: z.string(), days: z.number() }))
        .query(async ({ ctx, input }) => {
            const { playlistId, days } = input;
            const playlist = await ctx.db.playlistAnalyse.findUnique({
                where: {
                    id: playlistId,
                },
                select: {
                    id: true,
                },
            });
            if (!playlist) throw new TRPCError({ code: "BAD_REQUEST", message: "Playlist not found" });

            const endDate = new Date(); // Heutiges Datum
            const startDate = subDays(endDate, days); // Startdatum (vor 'days' Tagen)

            try {
                const allDays = eachDayOfInterval({ start: startDate, end: endDate });

                const dailyFollows = await Promise.all(
                    allDays.map(async (day) => {
                        const dateString = format(day, "yyyy-MM-dd"); // Datum im Format YYYY-MM-DD
                        const redisKey = `playlist:analyse:${ctx.session.user.id}:${playlist.id}:${dateString}`;

                        try {
                            const data = await redis.hgetall(redisKey);

                            if (data) {
                                const follows = Number(data.follows) || 0;

                                return { date: dateString, follows };
                            } else {
                                return { date: dateString, follows: 0 }; // Standardwert, wenn keine Daten vorhanden sind
                            }
                        } catch (error) {
                            console.error(
                                `Fehler beim Abrufen der Daten für Schlüssel ${redisKey}:`,
                                error,
                            );
                            return { date: dateString, follows: 0 }; // Standardwert bei Fehler
                        }
                    }),
                );

                return dailyFollows;
            } catch (error) {
                console.error("Fehler beim Abrufen der Daten aus Redis:", error);
                return [];
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

function aggregateFollows(
    data: { date: Date; follows: number }[],
): { date: Date; follows: number }[] {
    const aggregationMap = new Map<
        string,
        { sum: number; count: number }
    >();

    for (const item of data) {
        const dateKey = item.date.toISOString().split("T")[0];

        if (aggregationMap.has(dateKey!)) {
            const current = aggregationMap.get(dateKey!)!;
            current.sum += item.follows;
            current.count += 1;
        } else {
            aggregationMap.set(dateKey!, {
                sum: item.follows,
                count: 1,
            });
        }
    }

    const aggregatedData = Array.from(
        aggregationMap.entries(),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ).map(([dateKey, { sum, count }]) => {
        return {
            date: new Date(dateKey),
            // conversionRate: sum / count,
            follows: sum,
        };
    });

    const sortedData = aggregatedData.sort(
        (a, b) => a.date.getTime() - b.date.getTime(),
    );

    return sortedData;
}