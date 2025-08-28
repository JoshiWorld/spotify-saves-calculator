import { LinkStatsCards } from "@/app/_components/appNew/links/link-stats-cards";
import { LinkStatsOverviewChart } from "@/app/_components/appNew/links/link-stats-overview-chart";
import { LinksOverview } from "@/app/_components/appNew/links/links-overview";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Smartlinks | SmartSavvy",
  description: "SmartSavvy Smartlinks",
};

export default async function Page() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <LinkStatsCards />
          <div className="px-4 lg:px-6">
            <LinkStatsOverviewChart />
          </div>
          <LinksOverview />
        </div>
      </div>
    </div>
  );
}
