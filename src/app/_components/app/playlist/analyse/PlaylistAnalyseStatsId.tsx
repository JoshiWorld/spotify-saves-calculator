"use client";

import { api } from "@/trpc/react";
import { cn } from "@/lib/utils";
import React, { useRef, useState } from "react";
import { motion, useInView, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingSkeleton } from "@/components/ui/loading";

export function PlaylistStatsOverview({ id }: { id: string }) {
  const [statsRange, setStatsRange] = useState("7");

  const [playlist] = api.playlistAnalyse.get.useSuspenseQuery({ id });

  if (!playlist) {
    return <LoadingSkeleton />;
  }

  return (
    <div
      className={`my-5 flex w-1/2 flex-col items-center justify-center rounded-sm border border-black border-opacity-40 bg-zinc-50 bg-opacity-95 p-5 shadow-xl dark:border-white dark:border-opacity-40 dark:bg-zinc-950 dark:bg-opacity-95`}
    >
      <div className="flex w-full justify-end gap-4">
        <Select onValueChange={setStatsRange} value={statsRange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Select a fruit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Heute</SelectItem>
            <SelectItem value="7">Letzte 7 Tage</SelectItem>
            <SelectItem value="14">Letzte 14 Tage</SelectItem>
            <SelectItem value="28">Letzte 28 Tage</SelectItem>
            {/* <SelectItem value="alltime">Gesamter Zeitraum</SelectItem> */}
            {/* <SelectItem value="custom">Zeitraum auswählen</SelectItem> */}
          </SelectContent>
        </Select>
      </div>
      <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        Statistiken - {playlist.name}
      </h2>
      <p>Stats der letzten {statsRange} Tage</p>
      <PlaylistStats id={id} statsRange={statsRange} />
      <AllCharts id={id} statsRange={statsRange} />
    </div>
  );
}

function PlaylistStats({ id, statsRange }: { id: string; statsRange: string }) {
  const [stats] = api.playlistAnalyse.getStatsDifference.useSuspenseQuery({
    id,
    days: Number(statsRange),
  });

  const followsDifference = stats.follows - stats.followsBefore;
  const gainedDifference = stats.gained - stats.gainedBefore;
  const lostDifference = stats.lost - stats.lostBefore;

  const betterFollows = followsDifference > 0;
  const betterGained = gainedDifference > 0;
  const betterLost = lostDifference > 0;

  return (
    <section className="group/container relative mx-auto w-full max-w-7xl overflow-hidden rounded-3xl p-10">
      <div className="relative z-20">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-3">
          {/* Follows */}
          <motion.div
            initial={{
              y: 20,
              opacity: 0,
              filter: "blur(4px)",
            }}
            animate={{
              y: 0,
              opacity: 1,
              filter: "blur(0px)",
            }}
            transition={{
              duration: 0.5,
              delay: 1 * 0.1,
            }}
            key={"visits"}
            className={cn("group/card relative overflow-hidden rounded-lg")}
          >
            <div className="flex flex-col items-center gap-2">
              <p>Follower</p>
              <p className="text-3xl font-bold text-neutral-700 dark:text-neutral-200">
                <AnimatedNumber value={stats.follows} />
              </p>
              <p
                className={`text-xs italic ${betterFollows ? "text-green-500" : "text-red-500"}`}
              >
                {betterFollows ? `+${followsDifference}` : followsDifference}
              </p>
            </div>
          </motion.div>

          {/* Gained */}
          <motion.div
            initial={{
              y: 20,
              opacity: 0,
              filter: "blur(4px)",
            }}
            animate={{
              y: 0,
              opacity: 1,
              filter: "blur(0px)",
            }}
            transition={{
              duration: 0.5,
              delay: 2 * 0.1,
            }}
            key={"clicks"}
            className={cn("group/card relative overflow-hidden rounded-lg")}
          >
            <div className="flex flex-col items-center gap-2">
              <p>Follows Gained</p>
              <p className="text-3xl font-bold text-neutral-700 dark:text-neutral-200">
                <AnimatedNumber value={stats.gained} />
              </p>
              <p
                className={`text-xs italic ${betterGained ? "text-green-500" : "text-red-500"}`}
              >
                {betterGained ? `+${gainedDifference}` : gainedDifference}
              </p>
            </div>
          </motion.div>

          {/* Lost */}
          <motion.div
            initial={{
              y: 20,
              opacity: 0,
              filter: "blur(4px)",
            }}
            animate={{
              y: 0,
              opacity: 1,
              filter: "blur(0px)",
            }}
            transition={{
              duration: 0.5,
              delay: 3 * 0.1,
            }}
            key={"conversion"}
            className={cn("group/card relative overflow-hidden rounded-lg")}
          >
            <div className="flex flex-col items-center gap-2">
              <p>Follows Lost</p>
              <p className="text-3xl font-bold text-neutral-700 dark:text-neutral-200">
                <AnimatedNumber value={stats.lost} />
              </p>
              <p
                className={`text-xs italic ${betterLost ? "text-green-500" : "text-red-500"}`}
              >
                {betterLost
                  ? `+${lostDifference}`
                  : lostDifference}
                %
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function AnimatedNumber({
  value,
  initial = 0,
}: {
  value: number | string;
  initial?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref);

  const spring = useSpring(initial, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) =>
    Math.round(current).toLocaleString(),
  );

  useEffect(() => {
    if (isInView) {
      spring.set(Number(value));
    } else {
      spring.set(initial);
    }
  }, [isInView, spring, value, initial]);

  return <motion.span ref={ref}>{display}</motion.span>;
}


type StatsType = {
  stats: {
    date: string;
    follows: number;
    gained: number;
    lost: number;
  } [];
  statsBefore: {
    date: string;
    follows: number;
    gained: number;
    lost: number;
  } [];
}

function AllCharts({
  id,
  statsRange,
}: {
  id: string;
  statsRange: string;
}) {
  const [stats] = api.playlistAnalyse.getStats.useSuspenseQuery({
    id,
    days: Number(statsRange)
  });

  if (!stats) {
    return <LoadingSkeleton />
  }

  return (
    <div className="w-full flex flex-col gap-5">
      <FollowsChart stats={stats} />
      <GainedChart stats={stats} />
      <LostChart stats={stats} />
    </div>
  )
}

const followChartConfig = {
  follows: {
    label: "Aktuell",
    color: "hsl(var(--chart-2))",
  },
  lastFollows: {
    label: "Vergangene Woche",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;

function FollowsChart({
  stats
}: {
  stats: StatsType;
}) {
  const followStats = stats.stats.map((stat, idx) => {
    const lastStat = stats.statsBefore[idx]?.follows ?? 0;
    const yAxis = lastStat > stat.follows ? lastStat*1.2 : stat.follows*1.2;

    return {
      date: stat.date,
      follows: stat.follows,
      lastFollows: lastStat,
      yAxis
    }
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Follower - Wochenvergleich</CardTitle>
        <CardDescription>Diese Woche vs Vorherige Woche</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={followChartConfig}>
          <LineChart
            accessibilityLayer
            data={followStats}
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
              dataKey="yAxis"
              tickLine={true}
              axisLine={true}
              tickMargin={8}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="follows"
              type="monotone"
              stroke="var(--color-follows)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="lastFollows"
              type="monotone"
              stroke="var(--color-lastFollows)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

const gainedChartConfig = {
  gained: {
    label: "Aktuell",
    color: "hsl(var(--chart-2))",
  },
  lastGained: {
    label: "Vergangene Woche",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;

function GainedChart({
  stats
}: {
  stats: StatsType;
}) {
  const gainedStats = stats.stats.map((stat, idx) => {
    const lastStat = stats.statsBefore[idx]?.gained ?? 0;
    const yAxis = lastStat > stat.gained ? lastStat * 1.2 : stat.gained * 1.2;

    return {
      date: stat.date,
      gained: stat.gained,
      lastGained: lastStat,
      yAxis
    }
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Gained - Wochenvergleich</CardTitle>
        <CardDescription>Diese Woche vs Vorherige Woche</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={gainedChartConfig}>
          <LineChart
            accessibilityLayer
            data={gainedStats}
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
              dataKey="yAxis"
              tickLine={true}
              axisLine={true}
              tickMargin={8}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="gained"
              type="monotone"
              stroke="var(--color-gained)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="lastGained"
              type="monotone"
              stroke="var(--color-lastGained)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

const lostChartConfig = {
  lost: {
    label: "Aktuell",
    color: "hsl(var(--chart-2))",
  },
  lastLost: {
    label: "Vergangene Woche",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;

function LostChart({
  stats
}: {
  stats: StatsType;
}) {
  const lostStats = stats.stats.map((stat, idx) => {
    const lastStat = stats.statsBefore[idx]?.lost ?? 0;
    const yAxis = lastStat > stat.lost ? lastStat * 1.2 : stat.lost * 1.2;

    return {
      date: stat.date,
      lost: stat.lost,
      lastLost: lastStat,
      yAxis
    }
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Lost - Wochenvergleich</CardTitle>
        <CardDescription>Diese Woche vs Vorherige Woche</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={lostChartConfig}>
          <LineChart
            accessibilityLayer
            data={lostStats}
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
              dataKey="yAxis"
              tickLine={true}
              axisLine={true}
              tickMargin={8}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="lost"
              type="monotone"
              stroke="var(--color-lost)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="lastLost"
              type="monotone"
              stroke="var(--color-lastLost)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
