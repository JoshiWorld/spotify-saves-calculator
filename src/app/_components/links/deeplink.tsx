"use client";

export function getSpotifyDeeplink(uri: string): string | null {
  let id: string | null = null;
  let type: "track" | "album" | "playlist" | null = null;

  // Track
  if (uri.includes("/track/")) {
    const trackRegex =
      /(?:https?:\/\/open\.spotify\.com\/(?:intl-[a-z]{2}\/)?track\/)([a-zA-Z0-9]+)(?:\?|$)/;
    const trackMatch = trackRegex.exec(uri);
    if (trackMatch?.[1]) {
      id = trackMatch[1];
      type = "track";
    }
  }
  // Album
  else if (uri.includes("/album/")) {
    const albumRegex =
      /(?:https?:\/\/open\.spotify\.com\/(?:intl-[a-z]{2}\/)?album\/)([a-zA-Z0-9]+)(?:\?|$)/;
    const albumMatch = albumRegex.exec(uri);
    if (albumMatch?.[1]) {
      id = albumMatch[1];
      type = "album";
    }
  }
  // Playlist
  else if (uri.includes("/playlist/")) {
    const playlistRegex =
      /(?:https?:\/\/open\.spotify\.com\/(?:intl-[a-z]{2}\/)?playlist\/)([a-zA-Z0-9]+)(?:\?|$)/;
    const playlistMatch = playlistRegex.exec(uri);
    if (playlistMatch?.[1]) {
      id = playlistMatch[1];
      type = "playlist";
    }
  }

  if (id && type) {
    return `spotify:${type}:${id}`;
  }

  return null; // Ungültiger Link
}
