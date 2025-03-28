"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSkeleton } from "@/components/ui/loading";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/trpc/react";
import { UploadIcon } from "lucide-react";
import * as NextImage from "next/image";
import { useEffect, useRef, useState } from "react";
import { CreateSection } from "../sections/create-section";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type MinSection = {
  id: string;
  title: string;
  videos: {
    id: string;
    description: string | null;
    title: string;
    thumbnail: string;
    videoLink: string;
    usersWatched: {
      id: string;
    }[];
  }[];
};

export function CourseView({ id }: { id: string }) {
  const utils = api.useUtils();
  const { toast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [description, setDescription] = useState<string>("");
  const [title, setTitle] = useState<string>("");

  const { data: course, isLoading: isLoadingCourse } =
    api.course.getCourse.useQuery({ id });

  const updateCourseThumbnail = api.course.updateCourseThumbnail.useMutation({
    onSuccess: async () => {
      await utils.course.invalidate();
      toast({
        description: "Thumbnail wurde geupdatet",
      });
    },
  });

  useEffect(() => {
    if (course) {
      setDescription(course.description ?? "");
      setTitle(course.title);
    }
  }, [course]);

  if (isLoadingCourse || !course) {
    return <LoadingSkeleton />;
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      console.warn("Keine Datei ausgewählt.");
      return;
    }

    if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
      console.error(
        "Ungültiges Dateiformat. Nur PNG, JPG und JPEG sind erlaubt.",
      );
      return;
    }

    // Dateidimensionen prüfen (asynchron)
    const img = new Image();
    img.onload = async () => {
      let imageLink: string | null = course.thumbnail;

      if (imageLink) {
        const imageForm = new FormData();
        imageForm.append("file", file);
        imageForm.append("old", imageLink);

        const getImageLink = await fetch(
          "/api/protected/s3/uploadCourseThumbnail",
          {
            method: "PUT",
            body: imageForm,
          },
        );

        type ImageRes = {
          link: string;
        };

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const imageRes: ImageRes = await getImageLink.json();
        imageLink = imageRes.link;
      } else {
        imageLink = (await uploadImage(file)) ?? null;
      }

      if (!imageLink) {
        alert("Es gab einen Fehler mit dem Thumbnail.");
        return;
      }

      updateCourseThumbnail.mutate({ id, thumbnail: imageLink });
    };
    img.onerror = () => {
      console.error("Fehler beim Lesen der Bildabmessungen.");
    };
    img.src = URL.createObjectURL(file);
  };

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        {course.title}
      </h2>

      <div className="avatar-wrapper relative aspect-video w-1/2">
        <NextImage.default
          src={course.thumbnail}
          alt="Course Thumbnail"
          fill
          style={{
            objectFit: "cover",
          }}
          className="rounded-md"
        />
        <div className="avatar-overlay" onClick={handleUploadClick}>
          <UploadIcon className="h-4 w-4" />
        </div>
        <input
          type="file"
          accept="image/png, image/jpeg, image/jpg"
          className="hidden"
          onChange={handleFileChange}
          ref={fileInputRef}
        />
      </div>

      <div className="flex w-1/2 items-start justify-start gap-4">
        <Label htmlFor="title" className="w-32 text-left">
          Titel:
        </Label>
        <Input
          id="title"
          value={title}
          disabled
          onChange={(e) => setTitle(e.target.value)}
          className="w-full" // Input füllt den restlichen Platz aus
        />
      </div>

      <div className="flex w-1/2 items-start justify-start gap-4">
        <Label htmlFor="description" className="w-32 text-left">
          Beschreibung:
        </Label>
        <Textarea
          id="description"
          disabled
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full" // Textarea füllt den restlichen Platz aus
        />
      </div>

      <Button>Eingaben speichern</Button>

      <SectionsTable sections={course.sections} />

      <CreateSection courseId={course.id} />
    </div>
  );
}

function SectionsTable({ sections }: { sections: MinSection[] }) {
  if (sections.length === 0) {
    return <p>In diesem Kurs gibt es noch keine Sections.</p>;
  }

  return (
    <div className="mt-5 flex w-1/2 flex-col items-center gap-5">
      <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
        Sections
      </h3>
      {sections.map((section, idx) => (
        <div key={section.id} className="w-full">
          <Card className="w-full">
            <CardContent className="py-3">
              <div className="flex justify-between">
                <div className="flex flex-col">
                  <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                    {idx + 1}. {section.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {section.videos.length} Videos
                  </p>
                </div>

                <div className="flex w-1/2 items-center justify-end gap-3">
                  <Button variant="subtle" className="w-1/2">
                    Bearbeiten
                  </Button>
                  <Button variant="destructive">Löschen</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
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
