"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/trpc/react";
import { LogType } from "@prisma/client";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

const createLinkSchema = z.object({
  name: z.string().min(2, {
    message: "Der Link muss mindestens 2 Buchstaben enthalten",
  }),
  testEventCode: z.string(),
  pixelId: z.string().min(5, {
    message: "Du musst eine Pixel-ID angeben",
  }),
  accessToken: z.string().min(5, {
    message: "Du musst einen ConversionAPI-Token angeben",
  }),
  artist: z.string().min(2, {
    message: "Bitte gib den Namen des Artists ein",
  }),
  songtitle: z.string().min(2, {
    message: "Bitte gib einen Songtitel an",
  }),
  description: z.string(),
  genre: z.string().min(2, {
    message: "Bitte gib Genre an",
  }),
  spotifyUri: z.string().min(2, {
    message: "Bitte gib eine Spotify-URL an",
  }),
  appleUri: z.string(),
  deezerUri: z.string(),
  itunesUri: z.string(),
  napsterUri: z.string(),
  playbutton: z.boolean(),
  glow: z.boolean(),
  splittest: z.boolean(),
});

export function CreateLink() {
  const { toast } = useToast();
  const utils = api.useUtils();
  const router = useRouter();

  const [imageFile, setImageFile] = useState<File | null>(null);

  const form = useForm<z.infer<typeof createLinkSchema>>({
    resolver: zodResolver(createLinkSchema),
    defaultValues: {
      name: "",
      testEventCode: "",
      pixelId: "",
      accessToken: "",
      artist: "",
      songtitle: "",
      description: "",
      genre: "",
      spotifyUri: "",
      appleUri: "",
      deezerUri: "",
      itunesUri: "",
      napsterUri: "",
      playbutton: false,
      glow: true,
      splittest: false,
    },
  });

  const createLog = api.log.create.useMutation();
  const { data: genres, isLoading } = api.genre.getAll.useQuery();

  const createLink = api.link.create.useMutation({
    onSuccess: async () => {
      await utils.link.invalidate();
      toast({
        variant: "default",
        title: "Der Link wurde erstellt",
      });
      setImageFile(null);
      router.push("/app/links");
    },
    onError: (error) => {
      console.error("Fehler beim Erstellen des Links:", error);
      createLog.mutate({
        message: error.message,
        logtype: LogType.ERROR.toString(),
      });
      toast({
        variant: "destructive",
        title: "Fehler beim Erstellen des Links",
      });
    },
  });

  async function onSubmit(values: z.infer<typeof createLinkSchema>) {
    if (!values.spotifyUri.includes("spotify.com")) {
      alert("Bitte gebe eine gültige Spotify-URI an.");
      return;
    }

    const image = await getCoverURL(imageFile, values.spotifyUri);
    if(!image) {
        alert("Es gab einen Fehler mit deinem Cover. Wende dich an unseren Support.");
        return;
    }
    values.name = formatName(values.name);

    createLink.mutate({
      name: values.name,
      pixelId: values.pixelId,
      artist: values.artist,
      songtitle: values.songtitle,
      description: values.description,
      spotifyUri: values.spotifyUri,
      playbutton: values.playbutton,
      genre: values.genre,
      appleUri: values.appleUri,
      deezerUri: values.deezerUri,
      itunesUri: values.itunesUri,
      napsterUri: values.napsterUri,
      image,
      accessToken: values.accessToken,
      testEventCode: values.testEventCode,
      glow: values.glow,
      splittest: values.splittest
    });
  }

  if (isLoading) return <p>Daten werden geladen..</p>;
  if (!genres) return <p>Fehler beim Laden der Daten.</p>;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full max-w-md space-y-8"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name deiner URL*</FormLabel>
              <FormControl>
                <Input placeholder="bei-nacht" {...field} />
              </FormControl>
              <FormDescription>Das wird deine URL sein</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="artist"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Artist*</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="songtitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Song-Titel*</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="genre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Genre*</FormLabel>
              <Select onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Genre auswählen" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {genres.map((genre, index) => (
                    <SelectItem key={index} value={genre.id}>
                      {genre.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="pixelId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pixel-ID*</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="accessToken"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ConversionsAPI-Token*</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="testEventCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Test-Event-Code</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                Dieser Code wird nur am Anfang zum Senden der Serverevents
                benötigt. Sobald du die Events im Eventsmanager empfangen und
                freigegeben hast, musst du diesen Code wieder entfernen.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Beschreibung</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                Aktuell ein Platzhalter-Feld, was aber bis jetzt noch nicht
                angezeigt wird. Kommt in Zukunft.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="spotifyUri"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Spotify*</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>Der Link zum Song auf Spotify</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="appleUri"
          render={({ field }) => (
            <FormItem>
              <FormLabel>AppleMusic</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                Der Link zum Song auf AppleMusic (Optional)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="deezerUri"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deezer</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                Der Link zum Song auf Deezer (Optional)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="itunesUri"
          render={({ field }) => (
            <FormItem>
              <FormLabel>iTunes</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                Der Link zum Song auf iTunes (Optional)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="napsterUri"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Napster</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                Der Link zum Song auf Napster (Optional)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
          <Label htmlFor="image">Cover*</Label>
          <div className="flex flex-col gap-2">
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
            <p className="text-sm text-muted-foreground">
              Wenn du kein Cover hochlädst, wird dein Cover automatisch von
              Spotify gedownloadet, was allerdings zu schlechterer Qualität
              führt.
            </p>
          </div>
        </div>
        <FormField
          control={form.control}
          name="playbutton"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Abspielbares Cover</FormLabel>
                <FormDescription>
                  Zeigt einen Playbutton auf dem Cover an, wo man den Song
                  abspielen kann
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="glow"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Linkstyle im Glow</FormLabel>
                <FormDescription>
                  Verändert deinen Smartlink mit Gloweffekten
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="splittest"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Splittesting</FormLabel>
                <FormDescription>
                  Aktiviert den Splittestmodus. Dadurch werden verschiedene Linktypen ausgetestet
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={createLink.isPending}>
          {createLink.isPending ? "Wird erstellt..." : "Erstellen"}
        </Button>
      </form>
    </Form>
  );
}

function formatName(name: string) {
    return name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[äöü]/g, (match) =>
        match === "ä" ? "ae" : match === "ö" ? "oe" : "ue",
      )
      .replace(/[ÄÖÜ]/g, (match) =>
        match === "Ä" ? "Ae" : match === "Ö" ? "Oe" : "Ue",
      );
}

async function getCoverURL(file: File | null, spotifyUri: string) {
    let fileToUpload = file;

    if (!fileToUpload) {
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

    return `${imageUrl}${key}`;
}