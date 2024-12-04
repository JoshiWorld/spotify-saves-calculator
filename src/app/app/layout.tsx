import { getServerAuthSession } from "@/server/auth";
import { NavbarLoggedIn } from "@/app/_components/landing/navbar";
import { api } from "@/trpc/server";
import { redirect } from "next/navigation";
import { GridLineVertical } from "@/components/ui/background-grids";

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerAuthSession();
  if (!session?.user) return redirect("/login");

  await api.user.get.prefetch();

  return (
    <>
      {session?.user && <NavbarLoggedIn />}
      {/* <main className="mt-8 flex w-full flex-col items-center justify-center bg-background">
        {children}
      </main> */}
      <div className="relative flex min-h-screen w-full flex-col items-center overflow-hidden">
        <BackgroundGrids />
        {children}
      </div>
    </>
  );
}

export const BackgroundGrids = () => {
  return (
    <div className="pointer-events-none absolute left-0 top-0 z-0 grid h-full w-full -rotate-45 transform select-none grid-cols-2 gap-10 overflow-hidden md:grid-cols-4">
      <div className="relative h-full w-full">
        <GridLineVertical className="left-0" />
        <GridLineVertical className="left-auto right-0" />
      </div>
      <div className="relative h-full w-full">
        <GridLineVertical className="left-0" />
        <GridLineVertical className="left-auto right-0" />
      </div>
      <div className="relative h-full w-full bg-gradient-to-b from-transparent via-neutral-100 to-transparent dark:via-neutral-800">
        <GridLineVertical className="left-0" />
        <GridLineVertical className="left-auto right-0" />
      </div>
      <div className="relative h-full w-full">
        <GridLineVertical className="left-0" />
        <GridLineVertical className="left-auto right-0" />
      </div>
    </div>
  );
};