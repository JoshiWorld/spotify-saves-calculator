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
import { type Link } from "@prisma/client";
import { CheckIcon, FileEditIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ClipboardIcon } from "@radix-ui/react-icons";
import { IconTrash } from "@tabler/icons-react";

type ImageRes = {
  link: string;
};

export function Links() {
  const { data: links, isLoading } = api.link.getAll.useQuery();

  if (isLoading) return <LoadingCard />;
  if (!links) return <p>Server error</p>;

  return (
    <div className="flex w-full max-w-xl flex-col">
      {links.length !== 0 ? (
        <LinksTable links={links} />
      ) : (
        <p>Du hast noch keinen Link erstellt</p>
      )}
      <CreateLink />
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

function CreateLink() {
  const { toast } = useToast();
  const utils = api.useUtils();
  const [name, setName] = useState<string>("");
  const [testEventCode, setTestEventCode] = useState<string>("");
  const [pixelId, setPixelId] = useState<string>("");
  const [accessToken, setAccessToken] = useState<string>("");
  const [artist, setArtist] = useState<string>("");
  const [songtitle, setSongtitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [spotifyUri, setSpotifyUri] = useState<string>("");
  const [appleUri, setAppleUri] = useState<string>("");
  const [deezerUri, setDeezerUri] = useState<string>("");
  const [itunesUri, setItunesUri] = useState<string>("");
  const [napsterUri, setNapsterUri] = useState<string>("");
  const [playbutton, setPlaybutton] = useState<boolean>(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const createLink = api.link.create.useMutation({
    onSuccess: async () => {
      await utils.link.invalidate();
      toast({
        variant: "default",
        title: "Der Link wurde erstellt",
        description: `Name: ${name}`,
      });
      setName("");
    },
  });

  const createLinkMutate = async () => {
    if (!imageFile) {
      alert("Bitte füge noch ein Bild hinzu.");
      return;
    }

    const fileType = imageFile.type;
    const filename = imageFile.name;

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
      body: imageFile,
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
      appleUri,
      deezerUri,
      itunesUri,
      napsterUri,
      image, 
      accessToken,
      testEventCode,
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

function Stats() {
  const [stats] = api.linkstats.getAll.useSuspenseQuery();
  const linkViews = stats.filter((stat) => stat.event === "ssc-link-visit").reduce((total, stat) => total + stat.actions, 0);
  const linkClicks = stats.filter((stat) => stat.event === "ssc-link-click").reduce((total, stat) => total + stat.actions, 0);

  return (
    <div className="flex items-center justify-between py-10">
      <div className="flex flex-col items-center justify-center text-center">
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
          Views
        </h2>
        <p>{linkViews}</p>
        <p className="pt-6 text-xs italic text-green-500">+100 zur letzten Woche</p>
      </div>
      <div className="flex flex-col items-center justify-center text-center">
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
          Clicks
        </h2>
        <p>{linkClicks}</p>
        <p className="pt-6 text-xs italic text-red-500">-100 zur letzten Woche</p>
      </div>
    </div>
  );
}

function LinksTable({ links }: { links: Link[] }) {
  const utils = api.useUtils();
  const { toast } = useToast();
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const deleteLink = api.link.delete.useMutation({
    onSuccess: async () => {
      await utils.link.invalidate();
      toast({
        variant: "destructive",
        title: "Der Link wurde erfolgreich gelöscht",
      });
    },
  });

  const copyLink = async (url: string) => {
    const fullUrl = `${window.location.origin}/link/${url}`;

    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopiedLink(url);
    } catch (err) {
      console.error("Fehler beim Kopieren in die Zwischenablage:", err);
    }
  }

  return (
    <div>
      <Stats />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Titel</TableHead>
            <TableHead>URL</TableHead>
            <TableHead>Pixel-ID</TableHead>
            <TableHead className="text-center">Aktionen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {links.map((link) => (
            <TableRow key={`${link.name}`}>
              <TableCell className="font-medium">{link.songtitle}</TableCell>
              <TableCell className="flex items-center justify-between">
                {/* <p>{link.name}</p> */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      {!copiedLink || copiedLink !== link.name ? (
                        <ClipboardIcon
                          className="cursor-pointer"
                          onClick={() => copyLink(link.name)}
                        />
                      ) : (
                        <CheckIcon />
                      )}
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Link kopieren</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
              <TableCell>{link.pixelId}</TableCell>
              <TableCell className="flex items-center justify-between">
                <FileEditIcon
                  className="hover:cursor-pointer"
                  onClick={() => setEditingLink(link)}
                />
                <IconTrash
                  color="red"
                  className="hover:cursor-pointer"
                  onClick={() => deleteLink.mutate({ id: link.id })}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {editingLink && (
        <EditLink link={editingLink} onClose={() => setEditingLink(null)} />
      )}
    </div>
  );
}

function EditLink({
  link,
  onClose,
}: {
  link: Link;
  onClose: () => void;
}) {
  const utils = api.useUtils();
  const { toast } = useToast();
  const [name, setName] = useState<string>(link.name);
  const [pixelId, setPixelId] = useState<string>(link.pixelId);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const [testEventCode, setTestEventCode] = useState<string>(link.testEventCode ?? "");
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const [accessToken, setAccessToken] = useState<string>(link.accessToken);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const [artist, setArtist] = useState<string>(link.artist);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const [songtitle, setSongtitle] = useState<string>(link.songtitle);
  const [description, setDescription] = useState<string>(link.description ?? "");
  const [spotifyUri, setSpotifyUri] = useState<string>(link.spotifyUri ?? "");
  const [appleUri, setAppleUri] = useState<string>(link.appleUri ?? "");
  const [deezerUri, setDeezerUri] = useState<string>(link.deezerUri ?? "");
  const [itunesUri, setItunesUri] = useState<string>(link.itunesUri ?? "");
  const [napsterUri, setNapsterUri] = useState<string>(link.napsterUri ?? "");
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const [playbutton, setPlaybutton] = useState<boolean>(link.playbutton);
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
    let image = link.image ?? "";

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
      id: link.id,
      name,
      artist,
      songtitle,
      description,
      pixelId,
      image,
      spotifyUri,
      napsterUri,
      itunesUri,
      playbutton,
      appleUri,
      deezerUri,
      accessToken,
      testEventCode,
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
