import { TopNavigator } from "@/app/_components/nav";
import { api } from "@/trpc/server";
import { Package } from "@prisma/client";
import { redirect } from "next/navigation";

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await api.user.get();
  if (!user?.admin || !user.package || user.package === Package.STARTER) return redirect("/app/abo");

  return (
    <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
      {/* <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
        Smart<span className="text-primary">Savvy</span>
      </h1> */}
      <TopNavigator />
      {children}
    </div>
  );
}
