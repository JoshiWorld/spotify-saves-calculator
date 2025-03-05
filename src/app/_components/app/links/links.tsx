"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { CheckIcon, FileEditIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ClipboardIcon, OpenInNewWindowIcon } from "@radix-ui/react-icons";
import { IconTrash } from "@tabler/icons-react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";

type ImageRes = {
  link: string;
};

type LinkView = {
  id: string;
  name: string;
  artist: string;
  songtitle: string;
  pixelId: string;
  testMode: boolean;
  splittest: boolean;
};

export function Links() {
  const router = useRouter();
  const [links] = api.link.getAllView.useSuspenseQuery();

  return (
    <div className="flex w-full flex-col">
      {links.length !== 0 ? (
        <LinksTable links={links} />
      ) : (
        <p>Du hast noch keinen Link erstellt</p>
      )}
      <Button variant="default" className="mt-2" onClick={() => router.push("/app/links/create")}>
        Erstellen
      </Button>
      {/* <CreateLink /> */}
    </div>
  );
}

function LinksTable({ links }: { links: LinkView[] }) {
  const router = useRouter();
  const utils = api.useUtils();
  const { toast } = useToast();
  const [editingLink, setEditingLink] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const deleteLink = api.link.delete.useMutation({
    onSuccess: async () => {
      await utils.link.invalidate();
      toast({
        variant: "destructive",
        title: "Der Link wurde erfolgreich gelöscht",
      });
    },
    onError: (error) => {
      console.error("Fehler beim Löschen des Links:", error);
      toast({
        variant: "destructive",
        title: "Fehler beim Löschen des Links",
      });
    }
  });

  const copyLink = async (url: string, artist: string) => {
    const fullUrl = `${window.location.origin}/link/${artist.toLowerCase().replace(/\s+/g, '')}/${url}`;

    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopiedLink(url);
    } catch (err) {
      console.error("Fehler beim Kopieren in die Zwischenablage:", err);
    }
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[500px]">Titel</TableHead>
            <TableHead className="text-center">URL</TableHead>
            <TableHead>Artist</TableHead>
            <TableHead>Test-Modus</TableHead>
            <TableHead>Splittesting</TableHead>
            <TableHead className="w-[100px] text-center">Aktionen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {links.map((link) => (
            <TableRow key={`${link.name}`}>
              <TableCell
                className="font-medium hover:cursor-pointer hover:underline"
                onClick={() => router.push(`/app/links/stats/${link.id}`)}
              >
                {link.songtitle}
              </TableCell>
              <TableCell className="flex items-center justify-evenly">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      {!copiedLink || copiedLink !== link.name ? (
                        <ClipboardIcon
                          className="cursor-pointer"
                          onClick={() => copyLink(link.name, link.artist)}
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
                          const fullUrl = `${window.location.origin}/link/${link.artist
                            .toLowerCase()
                            .replace(/\s+/g, "")}/${link.name}`;
                          window.open(fullUrl, "_blank");
                        }}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Link öffnen</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
              <TableCell>{link.artist}</TableCell>
              <TableCell>{link.testMode ? "An" : "Aus"}</TableCell>
              <TableCell>{link.splittest ? "An" : "Aus"}</TableCell>
              <TableCell className="flex items-center justify-between">
                <FileEditIcon
                  className="transition-colors hover:cursor-pointer hover:text-yellow-500"
                  onClick={() => setEditingLink(link.id)}
                />
                <IconTrash
                  className="transition-colors hover:cursor-pointer hover:text-red-500"
                  onClick={() => deleteLink.mutate({ id: link.id })}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {editingLink && (
        <EditLink
          linkId={editingLink}
          onClose={() => setEditingLink(null)}
        />
      )}
    </div>
  );
}

function EditLink({
  linkId,
  onClose,
}: {
  linkId: string;
  onClose: () => void;
}) {
  const [link] = api.link.get.useSuspenseQuery({ id: linkId });

  const utils = api.useUtils();
  const { toast } = useToast();
  const [name, setName] = useState<string>(link!.name);
  const [pixelId, setPixelId] = useState<string>(link!.pixelId);
  const [testEventCode, setTestEventCode] = useState<string>(
    link!.testEventCode ?? "",
  );
  const [accessToken, setAccessToken] = useState<string>(link!.accessToken);
  const [artist, setArtist] = useState<string>(link!.artist);
  const [songtitle, setSongtitle] = useState<string>(link!.songtitle);
  const [description, setDescription] = useState<string>(
    link!.description ?? "",
  );
  const [genre, setGenre] = useState<string>(link!.genreId ?? "");
  const [spotifyUri, setSpotifyUri] = useState<string>(link!.spotifyUri ?? "");
  const [appleUri, setAppleUri] = useState<string>(link!.appleUri ?? "");
  const [deezerUri, setDeezerUri] = useState<string>(link!.deezerUri ?? "");
  const [itunesUri, setItunesUri] = useState<string>(link!.itunesUri ?? "");
  const [napsterUri, setNapsterUri] = useState<string>(link!.napsterUri ?? "");
  const [playbutton, setPlaybutton] = useState<boolean>(link!.playbutton);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const [testMode, setTestMode] = useState<boolean>(link!.testMode);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const [splittest, setSplittest] = useState<boolean>(link!.splittest);
  const [glow, setGlow] = useState<boolean>(link!.glow);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { data: genres } = api.genre.getAll.useQuery();

  const updateLink = api.link.update.useMutation({
    onSuccess: async () => {
      await utils.link.invalidate();
      toast({
        variant: "default",
        title: "Der Link wurde erfolgreich gespeichert",
      });
      onClose();
    },
  });

  const updateLinkMutate = async () => {
    let image = link!.image ?? "";

    if (imageFile) {
      if (image) {
        const imageForm = new FormData();
        imageForm.append("file", imageFile);
        imageForm.append("old", image);

        const getImageLink = await fetch("/api/protected/s3", {
          method: "PUT",
          body: imageForm,
        });
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const imageRes: ImageRes = await getImageLink.json();
        image = imageRes.link;
      } else {
        const imageForm = new FormData();
        imageForm.append("file", imageFile);

        const getImageLink = await fetch("/api/protected/s3", {
          method: "POST",
          body: imageForm,
        });
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const imageRes: ImageRes = await getImageLink.json();
        image = imageRes.link;
      }
    }

    updateLink.mutate({
      id: link!.id,
      name,
      artist,
      songtitle,
      description,
      pixelId,
      image,
      spotifyUri,
      napsterUri,
      genre,
      itunesUri,
      playbutton,
      appleUri,
      deezerUri,
      accessToken,
      testEventCode,
      glow,
      testMode,
      splittest
    });
  };

  if (!genres) return <p>Server error</p>;

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Link bearbeiten</SheetTitle>
          <SheetDescription>
            Hier kannst du Änderungen an deinem Link vornehmen
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name (Das wird deine URL sein)*
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) =>
                setName(e.target.value.toLowerCase().replace(/\s+/g, "-"))
              }
              className="col-span-3"
            />
          </div>
        </div>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="artist" className="text-right">
              Artist*
            </Label>
            <Input
              id="artist"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="songtitle" className="text-right">
              Song-Titel*
            </Label>
            <Input
              id="songtitle"
              value={songtitle}
              onChange={(e) => setSongtitle(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="genre" className="text-right">
              Genre*
            </Label>
            <Select value={genre} onValueChange={setGenre}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Genre auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {genres.map((genre, index) => (
                    <SelectItem key={index} value={genre.id}>
                      {genre.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="pixelId" className="text-right">
              Pixel-ID*
            </Label>
            <Input
              id="pixelId"
              value={pixelId}
              onChange={(e) => setPixelId(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="accessToken" className="text-right">
              ConversionsAPI-Token*
            </Label>
            <Input
              id="accessToken"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="testEventCode" className="text-right">
              Test-Event-Code*
            </Label>
            <Input
              id="testEventCode"
              value={testEventCode}
              onChange={(e) => setTestEventCode(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Beschreibung
            </Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="spotifyUri" className="text-right">
              Spotify-Link*
            </Label>
            <Input
              id="spotifyUri"
              value={spotifyUri}
              onChange={(e) => setSpotifyUri(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="appleUri" className="text-right">
              Apple-Music-Link
            </Label>
            <Input
              id="appleUri"
              value={appleUri}
              onChange={(e) => setAppleUri(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="deezerUri" className="text-right">
              Deezer-Link
            </Label>
            <Input
              id="deezerUri"
              value={deezerUri}
              onChange={(e) => setDeezerUri(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="itunesUri" className="text-right">
              iTunes-Link
            </Label>
            <Input
              id="itunesUri"
              value={itunesUri}
              onChange={(e) => setItunesUri(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="napsterUri" className="text-right">
              Napster-Link
            </Label>
            <Input
              id="napsterUri"
              value={napsterUri}
              onChange={(e) => setNapsterUri(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="image" className="text-right">
              Cover
            </Label>
            <Input
              id="image"
              type="file"
              accept=".jpg, .jpeg, .png"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setImageFile(e.target.files[0] ?? null);
                }
              }}
              className="col-span-3"
            />
          </div>
        </div>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="playbutton" className="text-right">
              Abspielbar
            </Label>
            <Checkbox
              id="playbutton"
              checked={playbutton}
              onCheckedChange={(value) => setPlaybutton(Boolean(value))}
            />
          </div>
        </div>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="glow" className="text-right">
              Glow-Effekt
            </Label>
            <Checkbox
              id="glow"
              checked={glow}
              onCheckedChange={(value) => setGlow(Boolean(value))}
            />
          </div>
        </div>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="testMode" className="text-right">
              Test-Modus
            </Label>
            <Checkbox
              id="testMode"
              checked={testMode}
              onCheckedChange={(value) => setTestMode(Boolean(value))}
            />
          </div>
        </div>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="splittest" className="text-right">
              Splittesting
            </Label>
            <Checkbox
              id="splittest"
              checked={splittest}
              onCheckedChange={(value) => setSplittest(Boolean(value))}
            />
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button
              type="submit"
              disabled={updateLink.isPending}
              onClick={updateLinkMutate}
            >
              {updateLink.isPending ? "Wird gespeichert..." : "Speichern"}
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
