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
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LogType, type Genre } from "@prisma/client";
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
};

export function Links() {
  // const { data: links, isLoading: linksLoading } = api.link.getAllView.useQuery();
  const [links] = api.link.getAllView.useSuspenseQuery();
  const { data: genres, isLoading: genresLoading } = api.genre.getAll.useQuery();

  if (genresLoading) return <LoadingCard />;
  if (!links || !genres) return <p>Server error</p>;

  return (
    <div className="flex w-full flex-col">
      {links.length !== 0 ? (
        <LinksTable links={links} genres={genres} />
      ) : (
        <p>Du hast noch keinen Link erstellt</p>
      )}
      <CreateLink genres={genres} />
    </div>
  );
}

function LoadingCard() {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="h-[125px] w-[250px] rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  );
}

function CreateLink({ genres }: { genres: Genre[] }) {
  const { toast } = useToast();
  const utils = api.useUtils();
  const [name, setName] = useState<string>("");
  const [testEventCode, setTestEventCode] = useState<string>("");
  const [pixelId, setPixelId] = useState<string>("");
  const [accessToken, setAccessToken] = useState<string>("");
  const [artist, setArtist] = useState<string>("");
  const [songtitle, setSongtitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [genre, setGenre] = useState<string>("");
  const [spotifyUri, setSpotifyUri] = useState<string>("");
  const [appleUri, setAppleUri] = useState<string>("");
  const [deezerUri, setDeezerUri] = useState<string>("");
  const [itunesUri, setItunesUri] = useState<string>("");
  const [napsterUri, setNapsterUri] = useState<string>("");
  const [playbutton, setPlaybutton] = useState<boolean>(false);
  const [glow, setGlow] = useState<boolean>(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const createLog = api.log.create.useMutation();

  const createLink = api.link.create.useMutation({
    onSuccess: async () => {
      await utils.link.invalidate();
      toast({
        variant: "default",
        title: "Der Link wurde erstellt",
        description: `Name: ${name}`,
      });
      setName("");
      setArtist("");
      setTestEventCode("");
      setPixelId("");
      setAccessToken("");
      setSongtitle("");
      setDescription("");
      setAppleUri("");
      setDeezerUri("");
      setSpotifyUri("");
      setItunesUri("");
      setNapsterUri("");
      setPlaybutton(false);
      setGlow(false);
      setImageFile(null);
    },
    onError: (error) => {
      console.error("Fehler beim Erstellen des Links:", error);
      createLog.mutate({ message: error.message, logtype: LogType.ERROR.toString() });
      toast({
        variant: "destructive",
        title: "Fehler beim Erstellen des Links",
      });
    }
  });

  const createLinkMutate = async () => {
    if(!spotifyUri.includes("spotify.com")) {
      alert("Bitte gebe eine gültige Spotify-URI an.");
      return;
    }

    let fileToUpload = imageFile;

    if (!fileToUpload) {
      if (!spotifyUri) {
        alert(
          "Bitte füge ein Bild hinzu oder gebe eine gültige Spotify-URI an.",
        );
        return;
      }

      try {
        // Hole das Cover-Bild von der Spotify-URI
        const spotifyResponse = await fetch(
          `/api/getSpotifyCover?uri=${spotifyUri}`,
        );
        if (!spotifyResponse.ok) {
          alert("Fehler beim Abrufen des Spotify-Covers");
          return;
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const { coverUrl } = await spotifyResponse.json();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const coverResponse = await fetch(coverUrl);

        if (!coverResponse.ok) {
          alert("Fehler beim Abrufen des Cover-Bildes");
          return;
        }

        const coverBlob = await coverResponse.blob();
        fileToUpload = new File([coverBlob], "spotify-cover.jpg", {
          type: coverBlob.type,
        });
      } catch (error) {
        console.error(
          "Fehler beim Abrufen oder Konvertieren des Spotify-Covers:",
          error,
        );
        alert("Ein unerwarteter Fehler ist aufgetreten.");
        return;
      }
    }

    const fileType = fileToUpload.type;
    const filename = fileToUpload.name;

    const signedUrlResponse = await fetch("/api/protected/s3/generateUrl", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filename,
        fileType,
      }),
    });

    if (!signedUrlResponse.ok) {
      alert("Fehler beim Abrufen der signierten URL");
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { uploadUrl, key, imageUrl } = await signedUrlResponse.json();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const uploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": fileType,
      },
      body: fileToUpload,
    });

    if (!uploadResponse.ok) {
      alert("Fehler beim Hochladen des Bildes");
      return;
    }

    const image = `${imageUrl}${key}`;

    createLink.mutate({
      name,
      pixelId,
      artist,
      songtitle,
      description,
      spotifyUri,
      playbutton,
      genre,
      appleUri,
      deezerUri,
      itunesUri,
      napsterUri,
      image, 
      accessToken,
      testEventCode,
      glow,
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" className="mt-2">
          Erstellen
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Link erstellen</DialogTitle>
          <DialogDescription>
            Hier kannst du eine Link erstellen
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name (Das wird deine URL sein)*
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                    .toLowerCase()
                    .replace(/\s+/g, "-")
                    .replace(/[äöü]/g, (match) =>
                      match === "ä" ? "ae" : match === "ö" ? "oe" : "ue",
                    )
                    .replace(/[ÄÖÜ]/g, (match) =>
                      match === "Ä" ? "Ae" : match === "Ö" ? "Oe" : "Ue",
                    ),
                )
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
              Test-Event-Code
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
        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="submit"
              disabled={createLink.isPending}
              onClick={createLinkMutate}
            >
              {createLink.isPending ? "Wird erstellt..." : "Erstellen"}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function LinksTable({ links, genres }: { links: LinkView[], genres: Genre[] }) {
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
            <TableHead className="w-[100px] text-center">Aktionen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {links.map((link) => (
            <TableRow key={`${link.name}`}>
              <TableCell
                className="font-medium hover:cursor-pointer hover:underline"
                onClick={() => router.push(`/app/links/${link.id}`)}
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
              <TableCell className="flex items-center justify-between">
                <FileEditIcon
                  className="text-white transition-colors hover:cursor-pointer hover:text-yellow-500"
                  onClick={() => setEditingLink(link.id)}
                />
                <IconTrash
                  className="text-white transition-colors hover:cursor-pointer hover:text-red-500"
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
          genres={genres}
        />
      )}
    </div>
  );
}

function EditLink({
  linkId,
  genres,
  onClose,
}: {
  linkId: string;
  genres: Genre[];
  onClose: () => void;
}) {
  const [link] = api.link.get.useSuspenseQuery({ id: linkId });

  const utils = api.useUtils();
  const { toast } = useToast();
  const [name, setName] = useState<string>(link!.name);
  const [pixelId, setPixelId] = useState<string>(link!.pixelId);
  const [testEventCode, setTestEventCode] = useState<string>(link!.testEventCode ?? "");
  const [accessToken, setAccessToken] = useState<string>(link!.accessToken);
  const [artist, setArtist] = useState<string>(link!.artist);
  const [songtitle, setSongtitle] = useState<string>(link!.songtitle);
  const [description, setDescription] = useState<string>(link!.description ?? "");
  const [genre, setGenre] = useState<string>(link!.genreId ?? "");
  const [spotifyUri, setSpotifyUri] = useState<string>(link!.spotifyUri ?? "");
  const [appleUri, setAppleUri] = useState<string>(link!.appleUri ?? "");
  const [deezerUri, setDeezerUri] = useState<string>(link!.deezerUri ?? "");
  const [itunesUri, setItunesUri] = useState<string>(link!.itunesUri ?? "");
  const [napsterUri, setNapsterUri] = useState<string>(link!.napsterUri ?? "");
  const [playbutton, setPlaybutton] = useState<boolean>(link!.playbutton);
  const [glow, setGlow] = useState<boolean>(link!.glow);
  const [imageFile, setImageFile] = useState<File | null>(null);

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
      if(image) {
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
    });
  }

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
