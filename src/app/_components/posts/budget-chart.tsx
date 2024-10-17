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
  budget: {
    label: "Aktuell",
    color: "hsl(var(--chart-2))",
  },
  lastBudget: {
    label: "Vergangene Woche",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;

export function PostBudgetChart({ posts }: { posts: Post[] }) {
  const sortedPosts = posts.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const last7Days = sortedPosts.slice(0, 7);
  const last14Days = sortedPosts.slice(7, 14);

  const combinedBudget = last7Days.map((post, index) => {
    const lastBudget = last14Days[index]?.budget ?? 0;

    return {
      ...post,
      lastBudget: Number(lastBudget),
    };
  });

  const newCombinedBudget = combinedBudget.reverse();
  const averageBudget =
    newCombinedBudget.reduce((sum, post) => sum + post.budget, 0) /
    newCombinedBudget.length;
  const averageLastBudget =
    newCombinedBudget.reduce((sum, post) => sum + post.lastBudget, 0) /
    newCombinedBudget.length;
  const trendPercentage =
    ((averageBudget - averageLastBudget) / averageLastBudget) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget - Wochenvergleich</CardTitle>
        <CardDescription>Diese Woche vs Vorherige Woche</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={newCombinedBudget}
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
              dataKey="budget"
              tickLine={true}
              axisLine={true}
              tickMargin={8}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="budget"
              type="monotone"
              stroke="var(--color-budget)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="lastBudget"
              type="monotone"
              stroke="var(--color-lastBudget)"
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
                      Die Durchschnittsausgaben der Woche sind zu{" "}
                      {Math.abs(trendPercentage).toFixed(2)}% niedriger als
                      vergangene Woche{" "}
                      <TrendingDown className="h-4 w-4 text-green-400" />
                    </>
                  ) : (
                    <>
                      Die Durchschnittsausgaben der Woche sind zu{" "}
                      {Math.abs(trendPercentage).toFixed(2)}% höher als vergangene
                      Woche <TrendingUp className="h-4 w-4 text-red-400" />
                    </>
                  )}
                </>
              ) : (
                <p>
                  Es wurden noch nicht genügen Daten gesammelt
                </p>
              )}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
