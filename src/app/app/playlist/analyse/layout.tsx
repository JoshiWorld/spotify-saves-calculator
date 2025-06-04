import { api } from "@/trpc/server";
import { Package } from "@prisma/client";
import { redirect } from "next/navigation";

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await api.user.get();
  if (!user?.admin && (!user?.package || user?.package === Package.STARTER)) {
    return redirect("/app/abo");
  }

  return children;
}
