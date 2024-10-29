import { api } from "@/trpc/server";
import { TopNavigator } from "./nav";
import { Projects } from "./projects";

export default async function HomePage() {
  await api.project.getAll.prefetch();
  await api.meta.getMetaAccounts.prefetch();

  return ( 
    <>
      <TopNavigator />
      <Projects />
    </>
  );
}
