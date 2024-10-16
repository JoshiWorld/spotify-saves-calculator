import { api } from "@/trpc/server";
import { TopNavigator } from "./nav";
import { Projects } from "./projects";

export default function HomePage() {
  void api.project.getAll.prefetch();

  return (
    <>
      <TopNavigator />
      <Projects />
    </>
  );
}
