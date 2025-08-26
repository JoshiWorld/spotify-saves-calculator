import { UserCourses } from "@/app/_components/app/courses/user-courses";

export default async function Page() {
  return (
    <div className="container z-20 my-10 flex flex-col items-center justify-center p-5">
      <div className="m-5 flex w-full flex-col items-center justify-center gap-5 rounded-sm border border-black border-opacity-40 bg-zinc-50 bg-opacity-95 p-5 shadow-xl dark:border-white dark:border-opacity-40 dark:bg-zinc-950 dark:bg-opacity-95">
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
          Kurse
        </h2>
        <UserCourses />
      </div>
    </div>
  );
}
