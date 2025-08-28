import { getServerAuthSession } from "@/server/auth";
import { NavbarLoggedIn } from "@/app/_components/landing/navbar";
import { redirect } from "next/navigation";
import { GridLineVertical } from "@/components/ui/background-grids";

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerAuthSession();
  if (!session?.user) return redirect("/login");

  return (
    <>
      <NavbarLoggedIn />
      <div className="relative flex min-h-screen w-full flex-col items-center">
        <BackgroundWrapper />
        {children}
      </div>
    </>
  );
}

const BackgroundWrapper = () => {
  return (
    <div className="pointer-events-none absolute inset-0 z-[-1] overflow-hidden">
      <BackgroundGrids />
    </div>
  );
};

const BackgroundGrids = () => {
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
      <div className="relative h-full w-full bg-linear-to-b from-transparent via-neutral-100 to-transparent dark:via-neutral-800">
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