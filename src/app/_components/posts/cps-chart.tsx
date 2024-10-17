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
  cps: {
    label: "Aktuell",
    color: "hsl(var(--chart-2))",
  },
  lastCPS: {
    label: "Vergangene Woche",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;

export function PostCPSChart({ posts }: { posts: Post[] }) {
  const sortedPosts = posts.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const last7Days = sortedPosts.slice(0, 7);
  const last14Days = sortedPosts.slice(7, 14);

  const combinedCPS = last7Days.map((post, index) => {
    const totalSavesAndAdds7 = post.saves + post.playlistAdds;
    const cps =
      totalSavesAndAdds7 > 0
        ? (post.budget / totalSavesAndAdds7).toFixed(2)
        : 0;

    const lastPost = last14Days[index];
    let lastCps = 0;

    if (lastPost) {
      const totalSavesAndAdds14 = lastPost.saves + lastPost.playlistAdds;
      lastCps =
        totalSavesAndAdds14 > 0
          ? Number((lastPost.budget / totalSavesAndAdds14).toFixed(2))
          : 0;
    }

    return {
      ...post,
      cps: Number(cps),
      lastCPS: Number(lastCps),
    };
  });

  const newCombinedCPS = combinedCPS.reverse();
  const averageCPS =
    newCombinedCPS.reduce((sum, post) => sum + post.cps, 0) /
    newCombinedCPS.length;
  const averageLastCPS =
    newCombinedCPS.reduce((sum, post) => sum + post.lastCPS, 0) /
    newCombinedCPS.length;
  const trendPercentage =
    ((averageCPS - averageLastCPS) / averageLastCPS) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>CPS - Wochenvergleich</CardTitle>
        <CardDescription>Diese Woche vs Vorherige Woche</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={newCombinedCPS}
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
              dataKey="cps"
              tickLine={true}
              axisLine={true}
              tickMargin={8}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="cps"
              type="monotone"
              stroke="var(--color-cps)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="lastCPS"
              type="monotone"
              stroke="var(--color-lastCPS)"
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
                      Die Durchschnittspreise der Woche sind zu{" "}
                      {Math.abs(trendPercentage).toFixed(2)}% günstiger als
                      vergangene Woche{" "}
                      <TrendingDown className="h-4 w-4 text-green-400" />
                    </>
                  ) : (
                    <>
                      Die Durchschnittspreise der Woche sind zu{" "}
                      {Math.abs(trendPercentage).toFixed(2)}% teurer als vergangene
                      Woche <TrendingUp className="h-4 w-4 text-red-400" />
                    </>
                  )}
                </>
              ) : (
                <p>
                  Es wurden noch nicht genügend Daten gesammelt
                </p>
              )}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
