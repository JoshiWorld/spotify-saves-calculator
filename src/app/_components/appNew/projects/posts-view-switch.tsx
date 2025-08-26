"use client";

import { PostsStatsCards, PostsStatsCardsAlltime } from "@/app/_components/appNew/projects/projects-stats-cards";
import { PostsStatsOverviewChart, PostsStatsOverviewChartAlltime } from "@/app/_components/appNew/projects/projects-stats-overview-chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { PostsOverview } from "./posts-overview";

export function PostsViewSwitch({ campaignId }: { campaignId: string }) {
    const [selectedView, setSelectedView] = useState("default");

    return (
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <Select onValueChange={setSelectedView} value={selectedView}>
                <SelectTrigger className="flex items-center justify-center mx-auto w-[180px]">
                    <SelectValue placeholder="Zeitraum auswählen" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="default">Letzte 28 Tage</SelectItem>
                    <SelectItem value="alltime">Gesamter Zeitraum</SelectItem>
                </SelectContent>
            </Select>

            {selectedView === "default" ? <PostsStatsCards campaignId={campaignId} /> : <PostsStatsCardsAlltime campaignId={campaignId} />}
            <div className="px-4 lg:px-6">
                {selectedView === "default" ? <PostsStatsOverviewChart campaignId={campaignId} /> : <PostsStatsOverviewChartAlltime campaignId={campaignId} />}
            </div>
            <PostsOverview campaignId={campaignId} />
        </div>
    );
}