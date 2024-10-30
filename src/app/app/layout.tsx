import { getServerAuthSession } from "@/server/auth";
import { NavbarLoggedIn } from "@/app/_components/landing/navbar";
import { api } from "@/trpc/server";
import { redirect } from "next/navigation";

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerAuthSession();
  if (!session?.user) return redirect("/login");
  
  await api.user.get.prefetch();

  return (
    <>
      {session?.user && <NavbarLoggedIn />}
      <main className="mt-8 flex w-full flex-col items-center justify-center bg-background">
        {children}
      </main>
    </>
  );
}
