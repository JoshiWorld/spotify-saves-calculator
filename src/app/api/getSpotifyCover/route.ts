import { api } from "@/trpc/server";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const uri = searchParams.get("uri");

  if (!uri) {
    return NextResponse.json({ error: "Invalid Spotify URI" }, { status: 400 });
  }

  const getToken = await api.spotify.getAccessToken();
  const trackId = extractSpotifyTrackId(uri);
  const playlistId = extractSpotifyPlaylistId(uri);

  if (!trackId && !playlistId) {
    return NextResponse.json(
      { error: "Could not get Spotify ID" },
      { status: 400 },
    );
  }

  try {
    let coverUrl: string | null;

    if(trackId) {
      coverUrl = await getTrackCoverUrl(trackId, getToken.accessToken);
    } else if(playlistId) {
      coverUrl = await getPlaylistCoverUrl(playlistId, getToken.accessToken);
    } else {
      coverUrl = null;
    }

    if(!coverUrl) {
      return NextResponse.json(
        { error: "Internal Server Error on getting CoverURL" },
        { status: 500 },
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return NextResponse.json({ coverUrl });
  } catch (error) {
    console.error("Error fetching Spotify cover:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

async function getTrackCoverUrl(id: string, token: string): Promise<string | null> {
  try {
    const spotifyResponse = await fetch(
      `https://api.spotify.com/v1/tracks/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`, // Stelle sicher, dass diese Umgebungsvariable definiert ist
        },
      },
    );

    if (!spotifyResponse.ok) {
      throw new Error(`Error: ${spotifyResponse.status}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data = await spotifyResponse.json();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    return String(data.album.images[0].url); // Nutze das größte Bild
  } catch(err) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    throw new Error(`Error: ${err}`);
  }
}

async function getPlaylistCoverUrl(
  id: string,
  token: string,
): Promise<string | null> {
  try {
    const spotifyResponse = await fetch(
      // `https://api.spotify.com/v1/tracks/${id}`,
      `https://api.spotify.com/v1/playlists/${id}/images`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!spotifyResponse.ok) {
      throw new Error(`Error: ${spotifyResponse.status}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data = await spotifyResponse.json();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    return String(data[0].url); // Nutze das größte Bild
  } catch (err) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    throw new Error(`Error: ${err}`);
  }
}

function extractSpotifyTrackId(uri: string): string | null {
  const regex =
    /(?:https?:\/\/open\.spotify\.com\/(?:intl-[a-z]{2}\/)?track\/)([a-zA-Z0-9]+)(?:\?|$)/;
  const match = regex.exec(uri);
  // @ts-expect-error || IGNORE
  return match ? match[1] : null;
}

function extractSpotifyPlaylistId(uri: string): string | null {
  const regex =
    /(?:https?:\/\/open\.spotify\.com\/(?:intl-[a-z]{2}\/)?playlist\/)([a-zA-Z0-9]+)(?:\?|$)/;
  const match = regex.exec(uri);
  // @ts-expect-error || IGNORE
  return match ? match[1] : null;
}