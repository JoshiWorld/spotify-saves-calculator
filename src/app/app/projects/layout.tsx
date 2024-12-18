import { TopNavigator } from "@/app/_components/app/nav";
import { api } from "@/trpc/server";
import { Package } from "@prisma/client";
import { redirect } from "next/navigation";

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await api.user.get();
  if (!user?.admin || !user.package || user.package === Package.STARTER)
    return redirect("/app/abo");

  return (
    <div className="container z-20 my-20 flex flex-col items-center justify-center rounded-sm border border-white border-opacity-40 bg-zinc-950 bg-opacity-95 p-5 shadow-xl">
      <TopNavigator />
      {children}
    </div>
  );
}
