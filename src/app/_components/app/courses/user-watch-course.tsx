"use client";

import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/ui/loading";
import { api } from "@/trpc/react";
import { PlayIcon } from "lucide-react";
import * as NextImage from "next/image";
import { useEffect, useState } from "react";

export function UserWatchCourse({ id }: { id: string }) {
  const { data: course, isLoading: isLoadingCourse } =
    api.course.getCourse.useQuery({ id });

  if (isLoadingCourse || !course) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        {course.title}
      </h2>

      <div className="avatar-wrapper relative aspect-video w-full">
        <NextImage.default
          src={course.thumbnail}
          alt="Course Thumbnail"
          fill
          style={{
            objectFit: "cover",
          }}
          className="rounded-md"
        />
      </div>

      <div className="w-full rounded-md bg-zinc-950 p-5 text-left text-sm text-zinc-300">
        {course.description ?? "Keine Beschreibung vorhanden"}
      </div>
    </div>
  );
}

export function UserWatchCourseVideo({
  id,
  videoId,
  sectionId,
}: {
  id: string;
  videoId: string;
  sectionId: string;
}) {
  const utils = api.useUtils();

  const { data: course, isLoading: isLoadingCourse } =
    api.course.getCourse.useQuery({ id });

  const watchedVideoMutation = api.course.userWatchedVideo.useMutation({
    onSuccess: async () => {
      await utils.course.getCourse.invalidate();
      console.log("Video marked as watched!");
    },
    onError: (error) => {
      console.error("Error marking video as watched:", error);
    }
  });

  const unwatchedVideoMutation = api.course.userUnwatchedVideo.useMutation({
    onSuccess: async () => {
      await utils.course.getCourse.invalidate();
      console.log("Video marked as unwatched!");
    },
    onError: (error) => {
      console.error("Error marking video as unwatched:", error);
    },
  });

  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayClick = () => {
    setIsPlaying(true);
  };

  useEffect(() => {
    setIsPlaying(false);
  }, [videoId]);

  if (isLoadingCourse || !course) {
    return <LoadingSkeleton />;
  }

  const section = course.sections.find((section) => section.id === sectionId);
  const video = section?.videos.find((video) => video.id === videoId);

  if (!video || !section) {
    return <p>Video nicht gefunden</p>;
  }

  const handleVideoEnded = () => {
    if(video.usersWatched.length <= 0) {
      watchedVideoMutation.mutate({ id: video.id });
    } 
  };

  const handleVideoEndedButton = () => {
    if (video.usersWatched.length > 0) {
      unwatchedVideoMutation.mutate({ id: video.id });
    } else {
      watchedVideoMutation.mutate({ id: video.id });
    }
  };

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        {video.title}
      </h2>

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
            onEnded={handleVideoEnded}
          />
        )}
      </div>

      <div className="w-full rounded-md bg-zinc-950 p-5 text-left text-sm text-zinc-300">
        {video.description ?? "Keine Beschreibung vorhanden"}
      </div>

      <Button onClick={handleVideoEndedButton} disabled={watchedVideoMutation.isPending || unwatchedVideoMutation.isPending}>
        {video.usersWatched.length > 0
          ? "Video als ungeschaut markieren"
          : "Video als abgeschlossen markieren"}
      </Button>
    </div>
  );
}
