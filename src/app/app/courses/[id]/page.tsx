import { CourseSidebar } from "@/app/_components/app/courses/sidebar";
import { UserWatchCourse, UserWatchCourseVideo } from "@/app/_components/app/courses/user-watch-course";
import { SidebarTrigger } from "@/components/ui/sidebar";

type Props = {
  id: string;
};

type PageProps = {
  params: Promise<Props>;
  searchParams: SearchParams;
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function Page({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { videoId, sectionId } = await searchParams;

  return (
    <>
      <CourseSidebar id={id} />
      <div className="relative m-5 w-full items-center justify-center rounded-sm border border-black border-opacity-40 bg-zinc-50 bg-opacity-95 p-5 shadow-xl dark:border-white dark:border-opacity-40 dark:bg-zinc-950 dark:bg-opacity-95">
        <div className="absolute left-0 top-0 z-10">
          <SidebarTrigger />
        </div>
        <div className="flex-grow text-center">
          {videoId && sectionId ? (
            <UserWatchCourseVideo id={id} videoId={String(videoId)} sectionId={String(sectionId)} />
          ) : (
            <UserWatchCourse id={id} />
          )}
        </div>
      </div>
    </>
  );
}
