import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { subDays } from "date-fns";
import { env } from "@/env";
import { Redis } from "@upstash/redis";

const redis = new Redis({
    url: env.KV_REST_API_URL,
    token: env.KV_REST_API_TOKEN,
});

export const dashboardRouter = createTRPCRouter({
    getDashboardCards: protectedProcedure
        .query(async ({ ctx }) => {
            const endDate = new Date();
            const startDate = subDays(endDate, 7);
            const startDateBefore = subDays(startDate, 7);

            try {
                /*** PROJECT CPS START ***/
                // Zeitraum A (aktuell)
                const posts = await ctx.db.project.findMany({
                    where: {
                        user: {
                            id: ctx.session.user.id,
                        },
                    },
                    select: {
                        campaigns: {
                            select: {
                                posts: {
                                    where: {
                                        date: {
                                            gte: startDate,
                                            lte: endDate,
                                        },
                                    },
                                    select: {
                                        budget: true,
                                        playlistAdds: true,
                                        saves: true,
                                    },
                                },
                            },
                        },
                    },
                });

                // Zeitraum B (davor)
                const postsBefore = await ctx.db.project.findMany({
                    where: {
                        user: {
                            id: ctx.session.user.id,
                        },
                    },
                    select: {
                        campaigns: {
                            select: {
                                posts: {
                                    where: {
                                        date: {
                                            gte: startDateBefore,
                                            lte: startDate,
                                        },
                                    },
                                    select: {
                                        budget: true,
                                        playlistAdds: true,
                                        saves: true,
                                    },
                                },
                            },
                        },
                    },
                });

                // Flatten Arrays
                const flatPosts = posts.flatMap((project) =>
                    project.campaigns.flatMap((campaign) => campaign.posts)
                );
                const flatPostsBefore = postsBefore.flatMap((project) =>
                    project.campaigns.flatMap((campaign) => campaign.posts)
                );

                // Stats berechnen
                const { cps } = calculateStatsProject(flatPosts);
                const { cps: cpsBefore } = calculateStatsProject(flatPostsBefore);
                /*** PROJECT CPS END ***/

                /*** SMARTLINKS CONVERSION START ***/
                // Alle linkIds des Benutzers abrufen (aus der Datenbank)
                const links = await ctx.db.link.findMany({
                    where: {
                        user: {
                            id: ctx.session.user.id,
                        },
                    },
                    select: {
                        id: true, // Nur die linkIds abrufen
                    },
                });

                const linkIds = links.map((link) => link.id);

                // Funktion zum Abrufen und Aggregieren der Daten für einen Link und Zeitraum
                const getAggregatedStatsForLink = async (
                    linkId: string,
                    startDate: Date,
                    endDate: Date,
                ) => {
                    const link = await ctx.db.link.findUnique({
                        where: {
                            id: linkId,
                        },
                        select: {
                            splittestVersion: true,
                        },
                    });
                    if (!link) throw Error("Link not found");

                    const keyPattern = `stats:${linkId}:*:*`;
                    const allKeys = await redis.keys(keyPattern);

                    if (!allKeys || allKeys.length === 0) {
                        return { visits: 0, clicks: 0 };
                    }

                    const relevantKeys = allKeys.filter((key) => {
                        const dateString = key.split(":")[3];
                        const keyDate = new Date(dateString!);
                        return keyDate >= startDate && keyDate <= endDate;
                    });

                    let totalVisits = 0;
                    let totalClicks = 0;

                    for (const key of relevantKeys) {
                        try {
                            const data = await redis.hgetall(key);

                            if (data) {
                                totalVisits += Number(data.visits) || 0;
                                totalClicks += Number(data.clicks) || 0;
                            }
                        } catch (parseError) {
                            console.error(
                                `Fehler beim Abrufen der Daten für Schlüssel ${key}:`,
                                parseError,
                            );
                        }
                    }

                    return { visits: totalVisits, clicks: totalClicks };
                };

                // 3. Daten für alle Links und Zeiträume abrufen und aggregieren
                let totalVisits = 0;
                let totalClicks = 0;
                let totalVisitsBefore = 0;
                let totalClicksBefore = 0;

                for (const linkId of linkIds) {
                    const currentStats = await getAggregatedStatsForLink(
                        linkId,
                        startDate,
                        endDate,
                    );
                    totalVisits += currentStats.visits;
                    totalClicks += currentStats.clicks;

                    const previousStats = await getAggregatedStatsForLink(
                        linkId,
                        startDateBefore,
                        startDate,
                    );
                    totalVisitsBefore += previousStats.visits;
                    totalClicksBefore += previousStats.clicks;
                }

                const conversionRate =
                    totalVisits > 0 ? (totalClicks / totalVisits) * 100 : 0;
                const conversionRateBefore =
                    totalVisitsBefore > 0
                        ? (totalClicksBefore / totalVisitsBefore) * 100
                        : 0;
                /*** SMARTLINKS CONVERSION END ***/

                /*** PLAYLIST FOLLOWS START ***/
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

                let newestFollows = 0;
                let newestFollowsBefore = 0;

                for (const playlistId of playlistIds) {
                    const currentStats = await getAggregatedStatsForPlaylist(
                        playlistId,
                        startDate,
                        endDate,
                    );
                    newestFollows = currentStats.latestFollows;

                    const previousStats = await getAggregatedStatsForPlaylist(
                        playlistId,
                        startDateBefore,
                        startDate,
                    );
                    newestFollowsBefore = previousStats.latestFollows;
                }
                /*** PLAYLIST FOLLOWS END ***/

                return {
                    conversionRate: Number(conversionRate.toFixed(2)),
                    playlistFollows: newestFollows,
                    cps: Number(cps.toFixed(2)),

                    conversionRateBefore: percentChange(conversionRate, conversionRateBefore),
                    playlistFollowsBefore: percentChange(newestFollows, newestFollowsBefore),
                    cpsBefore: percentChange(cps, cpsBefore),
                };
            } catch (error) {
                console.error("Fehler bei Dashboard-Stats:", error);
                return {
                    conversionRate: 0,
                    playlistFollows: 0,
                    cps: 0,
                    conversionRateBefore: 0,
                    playlistFollowsBefore: 0,
                    cpsBefore: 0,
                };
            }
        }),
    
    getLastActivities: protectedProcedure.query(({ ctx }) => {
        return ctx.db.activity.findMany({
            where: {
                user: {
                    id: ctx.session.user.id
                }
            },
            orderBy: {
                createdAt: "desc"
            },
            take: 10
        });
    })
})

function calculateStatsProject(posts: { budget: number; saves: number; playlistAdds: number }[]) {
    const budget = posts.reduce((sum, p) => sum + (p.budget || 0), 0);
    const saves = posts.reduce((sum, p) => sum + (p.saves || 0), 0) + posts.reduce((sum, p) => sum + (p.playlistAdds || 0), 0);
    const cps = saves > 0 ? budget / saves : 0;

    return { cps };
}

function percentChange(now: number, before: number): number {
    if (before === 0) {
        if (now === 0) return 0;
        return 100;
    }
    return Number((((now - before) / before) * 100).toFixed(2));
}