import { Projects } from "@/app/_components/app/projects";
import { api } from "@/trpc/server";

export default async function Home() {
  await api.project.getAll.prefetch();
  await api.meta.getMetaAccounts.prefetch();

  return <Projects />;
}
