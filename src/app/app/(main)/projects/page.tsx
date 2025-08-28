import { ProjectsOverview } from "@/app/_components/appNew/projects/projects-overview";
import { ProjectsStatsCards } from "@/app/_components/appNew/projects/projects-stats-cards";
import { ProjectStatsOverviewChart } from "@/app/_components/appNew/projects/projects-stats-overview-chart";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Spotify Saves Calculator | SmartSavvy",
  description: "Deine Projekte aus dem Spotify Saves Calculator",
};

export default async function Page() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <ProjectsStatsCards />
          <div className="px-4 lg:px-6">
            <ProjectStatsOverviewChart />
          </div>
          <ProjectsOverview />
        </div>
      </div>
    </div>
  );
}
