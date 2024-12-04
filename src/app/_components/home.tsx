import { api } from "@/trpc/server";
import { Projects } from "./projects";

export default async function HomePage() {
  await api.project.getAll.prefetch();
  await api.meta.getMetaAccounts.prefetch();

  return ( 
    <>
      <Projects />
    </>
  );
}
