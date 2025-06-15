import { z } from "zod";

import {
  adminProcedure,
  createTRPCRouter,
  publicProcedure,
} from "@/server/api/trpc";
import { randomBytes } from "crypto";
import { env } from "@/env";
import querystring from "querystring";
import { TRPCError } from "@trpc/server";
import { INTERNAL_SERVER_ERROR } from "@/lib/error";
import { Redis } from "@upstash/redis";

type TokenResponse = {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  refresh_token: string;
};

type PlaylistDetails = {
  id: string;
  snapshot_id: string;
  items: [
    {
      track: {
        uri: string;
      };
    },
  ];
};

const redis = new Redis({
  url: env.KV_REST_API_URL,
  token: env.KV_REST_API_TOKEN,
});

export const spotifyRouter = createTRPCRouter({
  /* DB STUFF */
  get: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.dataSaves.findUnique({
      where: {
        name: "spotify",
      },
    });
  }),

  update: adminProcedure
    .input(
      z.object({
        name: z.string(),
        state: z.string().optional(),
        authCode: z.string().optional(),
        access_token: z.string().optional(),
        scope: z.string().optional(),
        expires_in: z.number().optional(),
        refresh_token: z.string().optional(),
        token_type: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const dataToUpdate: Record<string, string | number> = {};
      if (input.authCode !== undefined) dataToUpdate.authCode = input.authCode;
      if (input.access_token !== undefined)
        dataToUpdate.accessToken = input.access_token;
      if (input.scope !== undefined) dataToUpdate.scope = input.scope;
      if (input.expires_in !== undefined)
        dataToUpdate.expiresIn = input.expires_in;
      if (input.refresh_token !== undefined)
        dataToUpdate.refreshToken = input.refresh_token;
      if (input.token_type !== undefined)
        dataToUpdate.tokenType = input.token_type;

      return ctx.db.dataSaves.update({
        where: {
          name: input.name,
        },
        data: dataToUpdate,
      });
    }),

  create: adminProcedure
    .input(
      z.object({
        name: z.string(),
        state: z.string(),
        authCode: z.string().optional(),
        access_token: z.string().optional(),
        scope: z.string().optional(),
        expires_in: z.number().optional(),
        refresh_token: z.string().optional(),
        token_type: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.db.dataSaves.create({
        data: {
          name: input.name,
          state: input.state,
          authCode: input.authCode,
          accessToken: input.access_token,
          scope: input.scope,
          expiresIn: input.expires_in,
          refreshToken: input.refresh_token,
          tokenType: input.token_type,
        },
      });
    }),
  /* DB STUFF END */

  /* SPOTIFY TOKEN LOGIC */
  getCode: adminProcedure.mutation(async ({ ctx }) => {
    const state = generateRandomString(16);
    const scope = "playlist-modify-public";
    const client_id = env.SPOTIFY_CLIENT_ID;
    const redirect_uri = `${ctx.headers.get("origin")}/app/admin/spotify`;
    const authUrl = generateAuthUrl(state, scope, client_id, redirect_uri);

    /* SAVE STATE TO DB */
    const dbEntry = await ctx.db.dataSaves.findUnique({
      where: {
        name: "spotify",
      },
      select: {
        state: true,
      },
    });

    if (dbEntry) {
      await ctx.db.dataSaves.update({
        where: {
          name: "spotify",
        },
        data: {
          state,
        },
      });
    } else {
      await ctx.db.dataSaves.create({
        data: {
          name: "spotify",
          state,
        },
      });
    }
    /* END SAVE STATE TO DB */

    return {
      authUrl,
    };
  }),

  generateToken: adminProcedure
    .input(
      z.object({
        authCode: z.string(),
        state: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.db.dataSaves.update({
        where: {
          name: "spotify",
        },
        data: {
          authCode: input.authCode,
          state: input.state,
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
          code: input.authCode,
          redirect_uri: `${ctx.headers.get("origin")}/app/admin/spotify`,
          grant_type: "authorization_code",
        }).toString(),
      });
      if (!response.ok) {
        throw INTERNAL_SERVER_ERROR("Spotify Token konnte nicht gefetched werden");
      }

      const result = (await response.json()) as TokenResponse;
      await ctx.db.dataSaves.update({
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
        message: "Token erfolgreich erhalten",
        accessToken: result.access_token,
      };
    }),

  updatePlaylist: publicProcedure.query(async ({ ctx }) => {
    const authHeader = ctx.headers.get('authorization');
    if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
      return new TRPCError({
        code: "UNAUTHORIZED",
      });
    }

    const spotify = await ctx.db.dataSaves.findFirst({
      where: {
        name: "spotify",
      },
      select: {
        accessToken: true,
        tokenType: true,
        refreshToken: true,
      },
    });

    if (!spotify) {
      throw INTERNAL_SERVER_ERROR("Spotify Eintrag konnte nicht gefunden werden");
    }

    const dateKey = new Date().toISOString().split("T")[0];
    const keyPattern = `stats:*:*:${dateKey}`;
    const stats: { id: string; visits: number; clicks: number; spotifyUri: string }[] = [];

    try {
      const keys = await redis.keys(keyPattern);
      if (!keys || keys.length === 0) {
        return {
          message: "Playlist nicht aktualisiert. Keine Ergebnisse gefunden.",
        };
      }

      for (const key of keys) {
        try {
          const data = await redis.hgetall<{ visits: string, clicks: string }>(key);
          const id = key.split(":")[1];

          if (!data || !id) continue;

          const existingStat = stats.find(stat => stat.id === id);

          if (existingStat) {
            existingStat.visits += Number(data.visits);
            existingStat.clicks += Number(data.clicks);
          } else {
            const link = await ctx.db.link.findUnique({
              where: {
                id
              },
              select: {
                spotifyUri: true,
              }
            });

            if (!link?.spotifyUri) continue;
            const spotifySongId = /track\/([a-zA-Z0-9]+)/.exec(link.spotifyUri);
            if (!spotifySongId) continue;

            stats.push({
              id: id,
              visits: Number(data.visits),
              clicks: Number(data.clicks),
              spotifyUri: `spotify:track:${spotifySongId[1]}`
            });
          }
        } catch (parseError) {
          console.error(
            `Fehler beim Abrufen der Daten für Schlüssel ${key}:`,
            parseError,
          );
        }
      }
    } catch (err) {
      console.error('Error in updatePlaylist:', err);
    }
    
    const spotifyUrisArray = stats.sort((a, b) => b.clicks - a.clicks).map((stat) => stat.spotifyUri);

    // Refresh Access Token
    const refreshedAccessToken = await refreshToken(ctx);

    // Get Playlist
    const playlist = await getPlaylist(
      spotify.tokenType!,
      refreshedAccessToken.accessToken,
    );

    if (playlist.tracks && playlist.tracks.length > 0) {
      // Remove Songs from Playlist
      const removeResponse = await removeSongsFromPlaylist(
        spotify.tokenType!,
        refreshedAccessToken.accessToken,
        playlist.tracks,
        playlist.snapshot_id,
      );
      if (!removeResponse.ok) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to remove songs from playlist",
        });
      }
    }

    if (spotifyUrisArray && spotifyUrisArray.length > 0) {
      // Add Songs to Playlist
      const addResponse = await addSongsToPlaylist(
        spotify.tokenType!,
        refreshedAccessToken.accessToken,
        spotifyUrisArray,
      );
      if (!addResponse.ok) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to add songs to playlist",
        });
      }
    }

    return {
      message: "Playlist erfolgreich aktualisiert",
    };
  }),

  getAccessToken: publicProcedure.query(async ({ ctx }) => {
    return refreshToken(ctx);
  }),
});

/* GENERATOR */

const generateRandomString = (length: number) => {
  return randomBytes(60).toString("hex").slice(0, length);
};

const generateAuthUrl = (
  state: string,
  scope: string,
  client_id: string,
  redirect_uri: string,
) => {
  const authUrl = `https://accounts.spotify.com/authorize?${querystring.stringify(
    {
      response_type: "code",
      client_id,
      scope,
      redirect_uri,
      state,
    },
  )}`;

  return authUrl;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const refreshToken = async (ctx: any) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  const spotify = await ctx.db.dataSaves.findUnique({
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
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to fetch Spotify token",
    });
  }

  const result = (await response.json()) as TokenResponse;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  await ctx.db.dataSaves.update({
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
  };
};

const addSongsToPlaylist = (
  tokenType: string,
  accessToken: string,
  uris: string[],
) => {
  return fetch(
    "https://api.spotify.com/v1/playlists/384u5JhYE0YapJ7InBR48m/tracks",
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `${tokenType} ${accessToken}`,
      },
      body: JSON.stringify({
        uris,
        position: 0,
      }),
    },
  );
};

const getPlaylist = async (tokenType: string, accessToken: string) => {
  const response = await fetch(
    "https://api.spotify.com/v1/playlists/384u5JhYE0YapJ7InBR48m/tracks",
    {
      method: "GET",
      headers: {
        Authorization: `${tokenType} ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to get playlist",
    });
  };

  const playlist = await response.json() as PlaylistDetails;
  const tracks = playlist.items.map((item) => ({ uri: item.track.uri }));

  return {
    snapshot_id: playlist.snapshot_id,
    tracks,
  }
};

const removeSongsFromPlaylist = (
  tokenType: string,
  accessToken: string,
  tracks: { uri: string }[],
  snapshot_id: string,
) => {
  return fetch(
    "https://api.spotify.com/v1/playlists/384u5JhYE0YapJ7InBR48m/tracks",
    {
      method: "DELETE",
      headers: {
        "content-type": "application/json",
        Authorization: `${tokenType} ${accessToken}`,
      },
      body: JSON.stringify({
        tracks,
        snapshot_id,
      }),
    },
  );
};