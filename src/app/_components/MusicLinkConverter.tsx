"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckIcon, ClipboardIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { OpenInNewWindowIcon } from "@radix-ui/react-icons";

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
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const { data, isLoading, error } = api.music.getUniversalLinks.useQuery(
    { songLink: songLink },
    { enabled: !!songLink }, // Query nur ausführen, wenn songLink vorhanden ist
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Triggert den Query durch das Ändern von songLink
  };

  const copyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(url);
    } catch (err) {
      console.error("Fehler beim Kopieren in die Zwischenablage:", err);
    }
  };

  return (
    <div className="container z-10 mt-20 rounded-sm border border-white border-opacity-40 bg-opacity-95 p-5 shadow-xl transition dark:bg-zinc-950">
      <div className="flex justify-center pb-5 pt-4">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          SavvyLinks
        </h1>
      </div>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[500px]">Store</TableHead>
                <TableHead className="text-center">URL</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(data.linksByPlatform).map(([platform, link]) => {
                if (!link) return null; // Überspringe Plattformen ohne Link

                const displayName = platformDisplayName[platform] ?? platform; // Verwende Anzeigenamen oder Plattformnamen

                return (
                  <TableRow key={platform}>
                    <TableCell
                      className="font-medium hover:cursor-pointer hover:underline"
                    >
                      {displayName}
                    </TableCell>
                    <TableCell className="flex items-center justify-evenly">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            {!copiedLink || copiedLink !== link.url ? (
                              <ClipboardIcon
                                className="cursor-pointer"
                                onClick={() => copyLink(link.url)}
                              />
                            ) : (
                              <CheckIcon />
                            )}
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Link kopieren</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <OpenInNewWindowIcon
                              className="cursor-pointer"
                              onClick={() => {
                                window.open(link.url, "_blank");
                              }}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Link öffnen</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                );
              })}
              {Object.keys(data.linksByPlatform).length === 0 && (
                <li>Keine Links gefunden.</li>
              )}
            </TableBody>
          </Table>
          <div className="flex justify-center">
            <p className="text-zinc-500">Powered by SongLink</p>
          </div>
        </div>
      )}
    </div>
  );
};
