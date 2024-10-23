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
import { DeleteIcon, EditIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function Links() {
  const { data: links, isLoading } = api.link.getAll.useQuery();

  if (isLoading) return <LoadingCard />;
  if (!links) return <p>Server error</p>;

  return (
    <div className="flex w-full max-w-md flex-col">
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
  const [image, setImage] = useState<string>("");

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
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="submit"
              disabled={createLink.isPending}
              onClick={() =>
                createLink.mutate({
                  name,
                  pixelId,
                  artist,
                  songtitle,
                  description,
                  spotifyUri,
                  appleUri,
                  deezerUri,
                  itunesUri,
                  napsterUri,
                  image,
                  accessToken,
                  testEventCode,
                })
              }
            >
              {createLink.isPending ? "Wird erstellt..." : "Erstellen"}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function LinksTable({ links }: { links: Link[] }) {
  const utils = api.useUtils();
  const { toast } = useToast();
  const [editingLink, setEditingLink] = useState<Link | null>(null);

  const deleteLink = api.link.delete.useMutation({
    onSuccess: async () => {
      await utils.project.invalidate();
      toast({
        variant: "destructive",
        title: "Der Link wurde erfolgreich gelöscht",
      });
    },
  });

  return (
    <div>
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
              <TableCell>{link.name}</TableCell>
              <TableCell>{link.pixelId}</TableCell>
              <TableCell className="flex items-center justify-between">
                <EditIcon
                  className="hover:cursor-pointer"
                  onClick={() => setEditingLink(link)}
                />
                <DeleteIcon
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
        <EditLink
          link={editingLink}
          onClose={() => setEditingLink(null)}
        />
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
  const [image, setImage] = useState<string>(link.image ?? "");

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
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button
              type="submit"
              disabled={updateLink.isPending}
              onClick={() =>
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
                  appleUri,
                  deezerUri,
                  accessToken,
                  testEventCode,
                })
              }
            >
              {updateLink.isPending ? "Wird gespeichert..." : "Speichern"}
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
