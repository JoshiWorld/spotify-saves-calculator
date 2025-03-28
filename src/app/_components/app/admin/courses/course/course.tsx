"use client";

import { LoadingSkeleton } from "@/components/ui/loading";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/trpc/react";
import { UploadIcon } from "lucide-react";
import * as NextImage from "next/image";
import { useRef } from "react";

export function CourseView({ id }: { id: string }) {
  const utils = api.useUtils();
  const { toast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);

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
    <div className="flex w-full flex-col items-center gap-3">
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
