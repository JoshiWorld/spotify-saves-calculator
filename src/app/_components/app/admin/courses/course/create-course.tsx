"use client";

import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/trpc/react";
import { useState } from "react";

export function CreateCourse() {
  const { toast } = useToast();
  const utils = api.useUtils();
  const [internalName, setInternalName] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [productLink, setProductLink] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);

  const createCourse = api.course.createCourse.useMutation({
    onSuccess: async () => {
      await utils.course.invalidate();
      toast({
        variant: "default",
        title: "Der Kurs wurde erstellt.",
        description: `Titel: ${title}`,
      });
      setInternalName("");
      setTitle("");
      setDescription("");
      setProductLink("");
      setThumbnail(null);
    },
  });

  const onSubmit = async () => {
    if (!thumbnail) {
      alert("Bitte lade noch ein Thumbnail hoch");
      return;
    }

    const image = await uploadImage(thumbnail);

    if (!image) {
      alert("Fehler beim uploaden vom Thumbnail.");
      return;
    }
    createCourse.mutate({ title, internalName, description, thumbnail: image, productLink });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex justify-center">
          <Button variant="default" className="mt-2">
            Kurs erstellen
          </Button>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Kurs erstellen</DialogTitle>
          <DialogDescription>
            Hier kannst du einen neuen Kurs erstellen
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="internalName" className="text-right">
              Interner Name
            </Label>
            <Input
              id="internalName"
              value={internalName}
              onChange={(e) => setInternalName(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="productlink" className="text-right">
              Produktlink
            </Label>
            <Input
              id="productlink"
              value={productLink}
              onChange={(e) => setProductLink(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Titel
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Beschreibung
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="thumbnail" className="text-right">
              Thumbnail
            </Label>
            <Input
              id="image"
              type="file"
              accept=".jpg, .jpeg, .png"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setThumbnail(e.target.files[0] ?? null);
                }
              }}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="submit"
              disabled={createCourse.isPending}
              onClick={onSubmit}
            >
              {createCourse.isPending ? "Wird erstellt..." : "Erstellen"}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

async function uploadImage(file: File) {
  const fileToUpload = file;
  const fileType = fileToUpload.type;
  const filename = fileToUpload.name;

  const signedUrlResponse = await fetch(
    "/api/protected/s3/uploadCourseThumbnail",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filename,
        fileType,
      }),
    },
  );

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
