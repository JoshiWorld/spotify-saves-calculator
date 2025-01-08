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

  try {
    const spotifyResponse = await fetch(
      `https://api.spotify.com/v1/tracks/${trackId}`,
      {
        headers: {
          Authorization: `Bearer ${getToken.accessToken}`, // Stelle sicher, dass diese Umgebungsvariable definiert ist
        },
      },
    );

    if (!spotifyResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch Spotify data" },
        { status: spotifyResponse.status },
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data = await spotifyResponse.json();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const coverUrl = data.album.images[0].url; // Nutze das größte Bild

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

function extractSpotifyTrackId(uri: string): string | null {
  const regex =
    /(?:https?:\/\/open\.spotify\.com\/(?:intl-[a-z]{2}\/)?track\/)([a-zA-Z0-9]+)(?:\?|$)/;
  const match = regex.exec(uri);
  // @ts-expect-error || IGNORE
  return match ? match[1] : null;
}
