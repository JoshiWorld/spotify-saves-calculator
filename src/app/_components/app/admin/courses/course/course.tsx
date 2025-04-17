"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSkeleton } from "@/components/ui/loading";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/trpc/react";
import { PlayIcon, UploadIcon } from "lucide-react";
import * as NextImage from "next/image";
import { useEffect, useRef, useState } from "react";
import { CreateSection } from "../sections/create-section";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { CreateVideo } from "../videos/create-video";
import { Checkbox } from "@/components/ui/checkbox";

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
      courseVideo: {
        id: string;
      };
    }[];
  }[];
};

type MinVideo = {
  id: string;
  description: string | null;
  title: string;
  thumbnail: string;
  videoLink: string;
  usersWatched: {
    courseVideo: {
      id: string;
    };
  }[];
};

export function CourseView({ id }: { id: string }) {
  const utils = api.useUtils();
  const { toast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [description, setDescription] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [productLink, setProductLink] = useState<string>("");
  const [active, setActive] = useState<boolean>(false);

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
      setProductLink(course.productLink);
      setActive(course.active);
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
          className="w-full"
        />
      </div>

      <div className="flex w-1/2 items-start justify-start gap-4">
        <Label htmlFor="productlink" className="w-32 text-left">
          Produktlink:
        </Label>
        <Input
          id="productlink"
          value={productLink}
          disabled
          onChange={(e) => setProductLink(e.target.value)}
          className="w-full"
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
          className="w-full"
        />
      </div>

      <div className="flex w-1/2 items-start justify-start gap-4">
        <Label htmlFor="active" className="w-32 text-left">
          Kurs aktiv:
        </Label>
        <Checkbox
          id="active"
          checked={active}
          disabled
          onCheckedChange={(checked) => setActive(Boolean(checked))}
          className="w-full"
        />
      </div>

      <Button>Eingaben speichern</Button>

      <SectionsTable sections={course.sections} />

      <CreateSection courseId={course.id} />
    </div>
  );
}

function SectionsTable({ sections }: { sections: MinSection[] }) {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const sectionsTableRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sectionsTableRef.current &&
        !sectionsTableRef.current.contains(event.target as Node) &&
        !dialogRef.current?.contains(event.target as Node)
      ) {
        setSelectedSection(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sectionsTableRef]);

  if (sections.length === 0) {
    return <p>In diesem Kurs gibt es noch keine Sections.</p>;
  }

  return (
    <div
      className="mt-5 flex w-1/2 flex-col items-center gap-5"
      ref={sectionsTableRef}
    >
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
                  <Button
                    variant="subtle"
                    className="w-1/2"
                    onClick={() => setSelectedSection(section.id)}
                  >
                    Bearbeiten
                  </Button>
                  <Button variant="destructive">Löschen</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {selectedSection === section.id && (
            <VideosTable
              videos={section.videos}
              sectionId={section.id}
              dialogRef={dialogRef}
              setIsDialogOpen={setIsDialogOpen}
              isDialogOpen={isDialogOpen}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function VideosTable({
  videos,
  sectionId,
  dialogRef,
  setIsDialogOpen,
  isDialogOpen,
}: {
  videos: MinVideo[];
  sectionId: string;
  dialogRef: React.RefObject<HTMLDivElement>;
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isDialogOpen: boolean;
}) {
  return (
    <motion.div
      className="mt-2 flex w-full origin-top flex-col gap-3 overflow-hidden rounded-md bg-zinc-100 p-4 dark:bg-zinc-900"
      initial={{ opacity: 0, scaleY: 0 }}
      animate={{ opacity: 1, scaleY: 1 }}
      exit={{ opacity: 0, scaleY: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {videos.map((video, idx) => (
        <VideoCard video={video} idx={idx + 1} key={video.id} />
      ))}

      <CreateVideo
        sectionId={sectionId}
        dialogRef={dialogRef}
        setIsDialogOpen={setIsDialogOpen}
        isDialogOpen={isDialogOpen}
      />
    </motion.div>
  );
}

function VideoCard({ video, idx }: { video: MinVideo; idx: number }) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayClick = () => {
    setIsPlaying(true);
  };

  return (
    <Card className="bg-zinc-950">
      <CardHeader>
        <CardTitle>
          {idx}. {video.title}
        </CardTitle>
        <CardDescription>{video.description ?? ""}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          <div className="relative aspect-video w-full">
            {!isPlaying ? (
              <>
                <NextImage.default
                  src={video.thumbnail}
                  alt="Video Thumbnail"
                  fill
                  style={{ objectFit: "cover" }}
                  className="rounded-md"
                />
                <div
                  className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-md bg-black bg-opacity-50"
                  onClick={handlePlayClick}
                >
                  <PlayIcon className="h-12 w-12 text-white" />
                </div>
              </>
            ) : (
              <video
                src={video.videoLink}
                controls
                autoPlay
                className="h-full w-full rounded-md object-cover"
              />
            )}
          </div>
          <p className="italic text-zinc-300">{`${video.usersWatched.length} Nutzer haben dieses Video gesehen`}</p>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-center justify-between">
          {/* <DeleteCourse id={course.id} /> */}
          <Button
            variant="subtle"
            // onClick={() =>
            //   router.push(`/app/admin/course/${course.id}`)
            // }
          >
            Bearbeiten
          </Button>
        </div>
      </CardFooter>
    </Card>
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
