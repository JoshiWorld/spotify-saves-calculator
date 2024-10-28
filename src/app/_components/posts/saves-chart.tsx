"use client";

import { type Post } from "@prisma/client";
import { TrendingUp, TrendingDown } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  totalSaves: {
    label: "Aktuell",
    color: "hsl(var(--chart-2))",
  },
  lastTotalSaves: {
    label: "Vergangene Woche",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;

type MinPost = {
  date: Date;
  id: string;
  saves: number;
  playlistAdds: number;
  budget: number;
};

export function PostSavesChart({ posts }: { posts: MinPost[] }) {
  const sortedPosts = posts.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const last7Days = sortedPosts.slice(0, 7);
  const last14Days = sortedPosts.slice(7, 14);

  const combinedSaves = last7Days.map((post, index) => {
    const totalSaves = post.saves + post.playlistAdds;

    const lastPost = last14Days[index];
    let lastTotalSaves = 0;

    if(lastPost) {
        lastTotalSaves = lastPost.saves + lastPost.playlistAdds;
    }

    return {
      ...post,
      totalSaves: Number(totalSaves),
      lastTotalSaves: Number(lastTotalSaves),
    };
  });

  const newCombinedSaves = combinedSaves.reverse();
  const averageSaves =
    newCombinedSaves.reduce((sum, post) => sum + post.totalSaves, 0) /
    newCombinedSaves.length;
  const averageLastSaves =
    newCombinedSaves.reduce((sum, post) => sum + post.lastTotalSaves, 0) /
    newCombinedSaves.length;
  const trendPercentage =
    ((averageSaves - averageLastSaves) / averageLastSaves) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Saves/Playlistadds - Wochenvergleich</CardTitle>
        <CardDescription>Diese Woche vs Vorherige Woche</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={newCombinedSaves}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={true}
              axisLine={true}
              tickMargin={8}
              tickFormatter={(value) => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                const date = new Date(value);
                return date.toLocaleDateString("de-DE", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <YAxis
              dataKey="lastTotalSaves"
              tickLine={true}
              axisLine={true}
              tickMargin={8}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="totalSaves"
              type="monotone"
              stroke="var(--color-totalSaves)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="lastTotalSaves"
              type="monotone"
              stroke="var(--color-lastTotalSaves)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              {trendPercentage ? (
                <>
                  {trendPercentage < 0 ? (
                    <>
                      Die Durchschnittssaves der Woche sind zu{" "}
                      {Math.abs(trendPercentage).toFixed(2)}% niedriger als
                      vergangene Woche{" "}
                      <TrendingDown className="h-4 w-4 text-red-400" />
                    </>
                  ) : (
                    <>
                      Die Durchschnittssaves der Woche sind zu{" "}
                      {Math.abs(trendPercentage).toFixed(2)}% höher als
                      vergangene Woche{" "}
                      <TrendingUp className="h-4 w-4 text-green-400" />
                    </>
                  )}
                </>
              ) : (
                <p>Es wurden noch nicht genügend Daten gesammelt</p>
              )}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
