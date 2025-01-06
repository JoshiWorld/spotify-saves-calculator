import { Projects } from "@/app/_components/app/projects";
import { api } from "@/trpc/server";
import { Package } from "@prisma/client";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await api.user.get();
  if (!user?.admin && (!user!.package || user!.package === Package.STARTER)) {
    return redirect("/app/abo");
  }

  await api.project.getAll.prefetch();
  await api.meta.getMetaAccounts.prefetch();

  return <Projects />;
}
