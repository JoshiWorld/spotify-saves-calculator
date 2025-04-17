"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
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
import { Progress } from "@/components/ui/progress";
import axios from "axios";

interface UploadResult {
  uploadUrl: string;
  key: string;
  imageUrl: string;
}

export function CreateVideo({
  sectionId,
  dialogRef,
  setIsDialogOpen,
  isDialogOpen
}: {
  sectionId: string;
  dialogRef: React.RefObject<HTMLDivElement>;
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isDialogOpen: boolean;
}) {
  const { toast } = useToast();
  const utils = api.useUtils();
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);

  const [thumbnailProgress, setThumbnailProgress] = useState(0);
  const [videoProgress, setVideoProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isSubmitAvailable, setIsSubmitAvailable] = useState(false);

  const createVideo = api.course.createVideo.useMutation({
    onSuccess: async () => {
      await utils.course.invalidate();
      toast({
        variant: "default",
        title: "Das VIdeo wurde hochgeladen.",
        description: `Titel: ${title}`,
      });
      setTitle("");
      setDescription("");
      setThumbnail(null);
      setVideo(null);
      setIsDialogOpen(false);
      setIsSubmitAvailable(false);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Fehler beim Erstellen des Videos",
      });
    },
  });

  const uploadFile = async (
    file: File,
    uploadType: "thumbnail" | "video",
  ): Promise<string | undefined> => {
    const uploadUrlEndpoint =
      uploadType === "thumbnail"
        ? "/api/protected/s3/uploadCourseThumbnail"
        : "/api/protected/s3/uploadCourseVideo";

    const setProgress =
      uploadType === "thumbnail" ? setThumbnailProgress : setVideoProgress;

    try {
      const signedUrlResponse = await fetch(uploadUrlEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filename: file.name,
          fileType: file.type,
        }),
      });

      if (!signedUrlResponse.ok) {
        toast({
          title: "Fehler",
          description: `Fehler beim Abrufen der signierten URL (${uploadType})`,
          variant: "destructive",
        });
        return undefined;
      }

      const { uploadUrl, key, imageUrl } =
        (await signedUrlResponse.json()) as UploadResult;

      // Axios für den Upload verwenden
      const uploadResponse = await axios.put(uploadUrl, file, {
        headers: {
          "Content-Type": file.type,
        },
        onUploadProgress: (progressEvent) => {
          const max = progressEvent.total ?? 100;
          const progress = Math.round((progressEvent.loaded * 100) / max);
          setProgress(progress);
        },
      });

      if (uploadResponse.status !== 200) {
        toast({
          title: "Fehler",
          description: `Fehler beim Uploaden des Bildes`,
          variant: "destructive",
        });
        return undefined;
      }

      if (uploadType !== "thumbnail") {
        setIsSubmitAvailable(true);
      } 

      return `${imageUrl}${key}`;
    } catch (error) {
      console.error(error);
      setIsSubmitAvailable(false);
      toast({
        title: "Fehler",
        description: `Fehler beim Uploaden des Bildes`,
        variant: "destructive",
      });
      return undefined;
    }
  };

  const onSubmit = async () => {
    if (!thumbnail) {
      toast({
        title: "Fehler",
        description: "Bitte lade noch ein Thumbnail hoch",
        variant: "destructive",
      });
      return;
    }

    if (!video) {
      toast({
        title: "Fehler",
        description: "Bitte lade noch ein Video hoch",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    let image: string | undefined;
    let videoLink: string | undefined;

    try {
      image = await uploadFile(thumbnail, "thumbnail");
      videoLink = await uploadFile(video, "video");

      if (!image || !videoLink) {
        setIsUploading(false);
        toast({
          title: "Fehler",
          description: "Es gab einen Fehler beim Hochladen der Daten",
          variant: "destructive",
        });
        return;
      }

      await createVideo.mutateAsync({
        title,
        sectionId,
        description,
        thumbnail: image,
        videoLink,
      });
    } catch (error) {
      console.error(error);
      setIsUploading(false);
      toast({
        title: "Fehler",
        description: "Es gab einen Fehler beim Erstellen des Videos",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <div className="flex justify-center">
          <Button variant="default" className="mt-2">
            Video hinzufügen
          </Button>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]" ref={dialogRef}>
        <DialogHeader>
          <DialogTitle>Video hinzufügen</DialogTitle>
          <DialogDescription>
            Hier kannst du ein neues Video zur Sektion hinzufügen
          </DialogDescription>
        </DialogHeader>
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
            {thumbnail && <Progress value={thumbnailProgress} />}
          </div>
        </div>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="video" className="text-right">
              Video
            </Label>
            <Input
              id="video"
              type="file"
              accept=".mov, .mp4, .webm, .ogg"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setVideo(e.target.files[0] ?? null);
                }
              }}
              className="col-span-3"
            />
            {video && <Progress value={videoProgress} />}
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            disabled={
              createVideo.isPending || isUploading
            }
            onClick={onSubmit}
          >
            {createVideo.isPending || isUploading ? "Wird hinzugefügt..." : "Hinzufügen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}