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
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CreateCourse } from "./courses/course/create-course";
import { DeleteCourse } from "./courses/course/delete-course";

export function AdminCourses() {
  const router = useRouter();

  const { data: courses, isLoading: isLoadingCourses } =
    api.course.getCourses.useQuery();

  if (isLoadingCourses || !courses) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="flex w-full flex-col items-center justify-center">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {courses.map((course) => (
          <Card key={course.id} className="bg-zinc-950">
            <CardHeader>
              <CardTitle>{course.title}</CardTitle>
              {/* <CardDescription>{course.description ?? ""}</CardDescription> */}
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                <div className="relative aspect-video w-full">
                  <Image
                    src={course.thumbnail}
                    alt="Course Thumbnail"
                    fill
                    style={{
                      objectFit: "cover",
                    }}
                    className="rounded-md"
                  />
                </div>
                <p className="italic text-zinc-300">{`${course._count.sections} Sektionen`}</p>
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex w-full items-center justify-between">
                <DeleteCourse id={course.id} />
                <Button
                  variant="subtle"
                  onClick={() => router.push(`/app/admin/course/${course.id}`)}
                >
                  Bearbeiten
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      <CreateCourse />
    </div>
  );
}