import { CampaignsOverview } from "@/app/_components/appNew/projects/campaigns-overview";
import { CampaignsStatsCards } from "@/app/_components/appNew/projects/projects-stats-cards";
import { CampaignStatsOverviewChart } from "@/app/_components/appNew/projects/projects-stats-overview-chart";
import { type Metadata } from "next";

type Props = {
  projectId: string;
};

type PageProps = {
  params: Promise<Props>;
};

export const metadata: Metadata = {
  title: "Spotify Saves Calculator | SmartSavvy",
  description: "Deine Projekte aus dem Spotify Saves Calculator",
};

export default async function Page({ params }: PageProps) {
  const { projectId } = await params;

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <CampaignsStatsCards projectId={projectId} />
          <div className="px-4 lg:px-6">
            <CampaignStatsOverviewChart projectId={projectId} />
          </div>
          <CampaignsOverview projectId={projectId} />
        </div>
      </div>
    </div>
  );
}