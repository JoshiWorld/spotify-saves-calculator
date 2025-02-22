import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { type SonglinkResponse } from "@/types/music";

export const musicRouter = createTRPCRouter({
  getUniversalLinks: publicProcedure
    .input(z.object({ songLink: z.string() }))
    .query(async ({ input }) => {
      try {
        const songLink = convertSonglink(input.songLink);

        // Songlink API aufrufen
        // https://api.song.link/v1-alpha.1/links?url=spotify%3Atrack%7BYKUw2kzza36vI1QOsC4a&userCountry=DE&songIfSingle=true
        // const apiUrl = `https://api.song.link/v1-alpha.1/links?url=${encodeURIComponent(
        //   songLink,
        // )}&userCountry=DE&songIfSingle=true`;
        const response = await fetch(songLink, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(
            `Songlink API Fehler: ${response.status} ${response.statusText}`,
          );
        }

        const data = (await response.json()) as SonglinkResponse;

        return data;
      } catch (error) {
        console.error("Fehler beim Abrufen der Universal Links:", error);
        if (error instanceof Error) {
          throw new Error(
            `Fehler beim Abrufen der Universal Links: ${error.message}`,
          );
        } else {
          throw new Error(`Fehler beim Abrufen der Universal Links`);
        }
      }
    }),
});

function convertSonglink(link: string): string {
  let songLink = link;

  // Spotify-Link konvertieren
  if (songLink.startsWith("https://open.spotify.com/")) {
    const trackIdMatch =
      /track\/([a-zA-Z0-9]+)/.exec(songLink) ??
      /track\/([a-zA-Z0-9]+)\?/.exec(songLink);
    if (trackIdMatch?.[1]) {
      const spotifyURI = `spotify:track:${trackIdMatch[1]}`;
      songLink = `https://api.song.link/v1-alpha.1/links?url=${encodeURIComponent(
        spotifyURI,
      )}&userCountry=DE&songIfSingle=true`;
    } else {
      throw new Error("Ungültiger Spotify-Link");
    }
  }
  // Apple Music-Link konvertieren
  else if (
    songLink.startsWith("https://music.apple.com/") ||
    songLink.startsWith("https://geo.music.apple.com/")
  ) {
    let albumId: string | undefined;
    let trackId: string | undefined;

    // Extrahiere Album-ID und Track-ID aus dem Link
    const albumIdMatch = /album\/[^\/]+\/(\d+)/.exec(songLink);
    if (albumIdMatch) {
      albumId = albumIdMatch[1];
    }

    const trackIdMatch = /\?i=(\d+)/.exec(songLink);
    if (trackIdMatch) {
      trackId = trackIdMatch[1];
    }

    if (albumId) {
      songLink = `https://api.song.link/v1-alpha.1/links?id=${albumId}&platform=appleMusic&type=album&userCountry=DE&songIfSingle=true`;
    } else if (trackId) {
      songLink = `https://api.song.link/v1-alpha.1/links?id=${trackId}&platform=appleMusic&type=album&userCountry=DE&songIfSingle=true`;
    } else {
      throw new Error("Ungültiger Apple Music-Link");
    }
  } else if (songLink.startsWith("https://www.deezer.com/")) {
    const trackIdMatch = /track\/(\d+)/.exec(songLink);
    if (trackIdMatch?.[1]) {
      songLink = `https://api.song.link/v1-alpha.1/links?id=${trackIdMatch[1]}&platform=deezer&type=song&userCountry=DE&songIfSingle=true`;
    } else {
      throw new Error("Ungültiger Deezer-Link");
    }
  }

  return songLink;
}
