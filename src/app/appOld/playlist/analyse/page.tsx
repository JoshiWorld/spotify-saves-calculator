import { PlaylistAnalyse } from "@/app/_components/app/playlist/analyse/PlaylistAnalyse";
// import { PlaylistAnalyseStats } from "@/app/_components/app/playlist/analyse/PlaylistAnalyseStats";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Playlist-Analyse | SmartSavvy",
  description: "SmartSavvy Playlist Analyzer",
};

export default async function Home() {
  return (
    <div className="container z-20 my-10 flex flex-col items-center justify-center p-5">
      <div className="my-5 flex w-1/2 flex-col items-center justify-center rounded-sm border border-black border-opacity-40 bg-zinc-50 bg-opacity-95 p-5 shadow-xl dark:border-white dark:border-opacity-40 dark:bg-zinc-950 dark:bg-opacity-95">
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
          Statistiken
        </h2>
        <p>Der letzten 7 Tage</p>
        {/* <PlaylistAnalyseStats /> */}
      </div>

      <div className="m-5 flex w-full flex-col items-center justify-center gap-5 rounded-sm border border-black border-opacity-40 bg-zinc-50 bg-opacity-95 p-5 shadow-xl dark:border-white dark:border-opacity-40 dark:bg-zinc-950 dark:bg-opacity-95">
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
          Deine Playlists
        </h2>
        <PlaylistAnalyse />
      </div>
    </div>
  );
}
