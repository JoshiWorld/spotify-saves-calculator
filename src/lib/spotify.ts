import { env } from "@/env";
import { db } from "@/server/db";
import { TRPCError } from "@trpc/server";

type TokenResponse = {
    access_token: string;
    token_type: string;
    scope: string;
    expires_in: number;
    refresh_token: string;
};

const getAccessTokenInternal = async () => {
    const bufferSeconds = 60; // 60 Sekunden Puffer

    const spotifyData = await db.dataSaves.findUnique({
        where: { name: "spotify" },
        select: {
            accessToken: true,
            refreshToken: true,
            expiresAt: true,
        },
    });

    if (
        spotifyData?.accessToken &&
        spotifyData.expiresAt &&
        spotifyData.expiresAt.getTime() > Date.now() + bufferSeconds * 1000
    ) {
        console.log("✅ Spotify: Gültiger Token aus Cache/DB verwendet.");
        return { accessToken: spotifyData.accessToken };
    }

    console.log("⚠️ Spotify: Token abgelaufen oder nicht vorhanden. Refreshe...");

    if (!spotifyData?.refreshToken) {
        throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "Kein Spotify Refresh-Token in der Datenbank gefunden.",
        });
    }

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
            refresh_token: spotifyData.refreshToken,
            client_id: env.SPOTIFY_CLIENT_ID,
            grant_type: "refresh_token",
        }).toString(),
    });

    if (!response.ok) {
        console.error("Spotify Token Refresh Error:", await response.text());
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch Spotify token",
        });
    }

    const result = (await response.json()) as TokenResponse;

    const newExpiresAt = new Date(Date.now() + result.expires_in * 1000);

    await db.dataSaves.update({
        where: { name: "spotify" },
        data: {
            accessToken: result.access_token,
            refreshToken: result.refresh_token,
            expiresIn: result.expires_in,
            tokenType: result.token_type,
            scope: result.scope,
            expiresAt: newExpiresAt,
        },
    });

    console.log("🔄 Spotify: Token erfolgreich aktualisiert und gespeichert.");

    return {
        accessToken: result.access_token,
    };
};

export const spotify = {
    getAccessToken: getAccessTokenInternal,
};