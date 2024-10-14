import { api, HydrateClient } from "@/trpc/server";
import { Projects } from "./_components/projects";

export default async function Home() {
  void api.project.getAll.prefetch();

  return (
    <HydrateClient>
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          Spotify <span className="text-primary">Saves</span> Calculator
        </h1>
        <Projects />
      </div>
    </HydrateClient>
  );
}
