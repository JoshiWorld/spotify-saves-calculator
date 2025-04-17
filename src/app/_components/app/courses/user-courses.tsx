"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/ui/loading";
import { api } from "@/trpc/react";
import { Lock } from "lucide-react";
import * as NextImage from "next/image";
import { useRouter } from "next/navigation";

type MinCourse = {
  id: string;
  _count: {
    sections: number;
  };
  description: string | null;
  title: string;
  thumbnail: string;
  productLink: string;
};

export function UserCourses() {
  const { data: userCourses, isLoading: isLoadingUserCourses } =
    api.course.getCourses.useQuery();
  const { data: allCourses, isLoading: isLoadingAllCourses } =
    api.course.getAllCourses.useQuery();

  if (
    isLoadingAllCourses ||
    isLoadingUserCourses ||
    !userCourses ||
    !allCourses
  ) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="flex w-full flex-col items-center justify-center">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {allCourses.map((course) => (
          <div key={course.id}>
            {userCourses.some((uCourse) => uCourse.id === course.id) ? (
              <UserBoughtCourse course={course} />
            ) : (
              <UserNotBoughtCourse course={course} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function UserBoughtCourse({ course }: { course: MinCourse }) {
  const router = useRouter();

  return (
    <Card className="bg-zinc-950">
      <CardHeader>
        <CardTitle>{course.title}</CardTitle>
        <CardDescription>{course.description ?? ""}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          <div className="relative aspect-video w-full">
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
          {/* <p className="italic text-zinc-300">{`${course._count.sections} Sektionen`}</p> */}
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-center justify-between">
          <Button
            variant="subtle"
            className="w-full"
            onClick={() => router.push(`/app/courses/${course.id}`)}
          >
            Anschauen
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

function UserNotBoughtCourse({ course }: { course: MinCourse }) {
//   const router = useRouter();

  return (
    <Card className="bg-zinc-950">
      <CardHeader>
        <CardTitle>{course.title}</CardTitle>
        <CardDescription>{course.description ?? ""}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          <div className="relative aspect-video w-full">
            <NextImage.default
              src={course.thumbnail}
              alt="Course Thumbnail"
              fill
              style={{
                objectFit: "cover",
              }}
              className="rounded-md"
            />
            <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black bg-opacity-50">
              <Lock className="h-12 w-12 text-white" />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-center justify-between">
          <Button
            variant="default"
            className="w-full"
            onClick={() => window.open(course.productLink, "_blank")}
          >
            Kurs kaufen
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}