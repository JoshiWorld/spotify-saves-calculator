import { env } from "@/env";
import { db } from "@/server/db";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

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

export async function GET() {
  try {
    const playlists = await db.playlistAnalyse.findMany({
      select: {
        id: true,
        playlistId: true,
        user: {
          select: {
            id: true
          }
        }
      }
    });

    const token = await refreshToken();

    for (const playlist of playlists) {
      const spotifyReq = await fetch(`https://api.spotify.com/v1/playlists/${playlist.playlistId}?fields=followers`, {
        method: "GET",
        headers: {
          "content-type": "application/json",
          Authorization: `${token.tokenType} ${token.accessToken}`,
        },
      });
      const data: SpotifyPlaylistFollower = await spotifyReq.json() as SpotifyPlaylistFollower;

      await updateRedis(playlist.user.id, playlist.id, data.followers.total);
      // await updateRedis(playlist.user.id, playlist.id, 11);
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Cron failed", error);
    return NextResponse.json(
      // @ts-expect-error || @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      { ok: false, error: error.message },
      { status: 500 },
    );
  }
}

async function updateRedis(userId: string, id: string, currentFollows: number) {
  const dateKey = new Date().toISOString().split("T")[0];
  // const testDate = new Date();
  // testDate.setDate(testDate.getDate()-1);
  // const dateKey = testDate.toISOString().split("T")[0];
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