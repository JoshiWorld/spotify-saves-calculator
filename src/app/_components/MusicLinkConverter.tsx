"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";

const platformDisplayName: Record<string, string> = {
  spotify: "Spotify",
  appleMusic: "Apple Music",
  deezer: "Deezer",
  youtubeMusic: "YouTube Music",
  amazonMusic: "Amazon Music",
  amazonStore: "Amazon Store",
  audiomack: "Audiomack",
  anghami: "Anghami",
  itunes: "iTunes",
  pandora: "Pandora",
  soundcloud: "SoundCloud",
  tidal: "Tidal",
  youtube: "YouTube",
};

export const MusicLinkConverter = () => {
  const [songLink, setSongLink] = useState("");
  const { data, isLoading, error } = api.music.getUniversalLinks.useQuery(
    { songLink: songLink },
    { enabled: !!songLink }, // Query nur ausführen, wenn songLink vorhanden ist
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Triggert den Query durch das Ändern von songLink
  };

  return (
    <div className="container z-10 mt-20 rounded-sm border border-white border-opacity-40 bg-opacity-95 p-5 shadow-xl transition dark:bg-zinc-950">
      <h2 className="mb-4 text-2xl font-bold">SavvyLinks</h2>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center gap-2"
      >
        <Input
          type="text"
          placeholder="Song-URL (Spotify, Apple Music, Deezer)"
          value={songLink}
          onChange={(e) => setSongLink(e.target.value)}
          className="rounded border px-3 py-2"
        />
        {/* <Button
          type="submit"
          disabled={!songLink}
          className="rounded px-4 py-2 w-36"
        >
          Links sammeln
        </Button> */}
      </form>

      {isLoading && <p className="mt-4">Lade...</p>}
      {error && <p className="mt-4 text-red-500">Fehler: {error.message}</p>}

      {data && (
        <div className="mt-4">
          {/* <h3 className="mb-2 text-xl font-semibold">Gefundene Links:</h3> */}
          <ul>
            {Object.entries(data.linksByPlatform).map(([platform, link]) => {
              if (!link) return null; // Überspringe Plattformen ohne Link

              const displayName = platformDisplayName[platform] ?? platform; // Verwende Anzeigenamen oder Plattformnamen

              return (
                <li key={platform}>
                  <b>{displayName}:</b>{" "}
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {link.url}
                  </a>
                </li>
              );
            })}
            {Object.keys(data.linksByPlatform).length === 0 && (
              <li>Keine Links gefunden.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};
