import { PlaylistAnalyseOverview } from "@/app/_components/app/playlist/analyse/PlaylistAnalyseOverview";
import { PlaylistAnalyseOverviewChart } from "@/app/_components/app/playlist/analyse/PlaylistAnalyseOverviewChart";
import { PlaylistAnalyseCards } from "@/app/_components/app/playlist/analyse/PlaylistAnalyseStats";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Playlist-Analyse | SmartSavvy",
  description: "SmartSavvy Playlist Analyzer",
};

export default async function Page() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <PlaylistAnalyseCards />
          <div className="px-4 lg:px-6">
            <PlaylistAnalyseOverviewChart />
          </div>
          <PlaylistAnalyseOverview />
        </div>
      </div>
    </div>
  );
}
