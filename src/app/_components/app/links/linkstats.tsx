"use client";

import { api } from "@/trpc/react";
import { cn } from "@/lib/utils";
import React, { useRef, useState } from "react";
import { motion, useInView, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";
import { TrendingUp, TrendingDown, CalendarIcon } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SplittestVersion } from "@prisma/client";
import { type DateRange } from "react-day-picker";
import { addDays, format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";

export function LinkStatsOverview({ id }: { id: string }) {
  const [statsRange, setStatsRange] = useState("7");
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 1),
  });

  const [link] = api.link.getLinkName.useSuspenseQuery({ id });
  const [splittest] = api.link.getSplittest.useSuspenseQuery({ id });

  return (
    <div
      className={`my-5 flex ${splittest ? "w-full" : "w-1/2"} flex-col items-center justify-center rounded-sm border border-black border-opacity-40 bg-zinc-50 bg-opacity-95 p-5 shadow-xl dark:border-white dark:border-opacity-40 dark:bg-zinc-950 dark:bg-opacity-95`}
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
            <SelectItem value="alltime">Gesamter Zeitraum</SelectItem>
            <SelectItem value="custom">Zeitraum auswählen</SelectItem>
          </SelectContent>
        </Select>

        {statsRange === "custom" && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[280px] justify-start text-left font-normal",
                  !date && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Datum auswählen</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="range"
                selected={date}
                defaultMonth={date?.from}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        )}
      </div>
      <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        Statistiken - {link!.songtitle}
      </h2>
      <p>Stats der letzten {statsRange} Tage</p>
      {splittest ? (
        <>
          {statsRange === "alltime" ? (
            <div className="flex w-full justify-center gap-16">
              {Object.keys(SplittestVersion).map((version) => (
                <div key={version} className="flex flex-col items-center">
                  <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight">
                    {version}
                  </h2>
                  <LinkStatsAlltimeSplittest
                    id={id}
                    splittestVersion={
                      SplittestVersion[version as keyof typeof SplittestVersion]
                    }
                  />
                  <ConversionChartAlltimeSplittest
                    id={id}
                    splittestVersion={
                      SplittestVersion[version as keyof typeof SplittestVersion]
                    }
                  />
                </div>
              ))}
            </div>
          ) : statsRange === "custom" ? (
            <div className="flex w-full justify-center gap-16">
              {Object.keys(SplittestVersion).map((version) => (
                <div key={version} className="flex flex-col items-center">
                  <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight">
                    {version}
                  </h2>
                  <LinkStatsRangeSplittest
                    id={id}
                    date={date}
                    splittestVersion={
                      SplittestVersion[version as keyof typeof SplittestVersion]
                    }
                  />
                  <ConversionChartRangeSplittest
                    id={id}
                    date={date}
                    splittestVersion={
                      SplittestVersion[version as keyof typeof SplittestVersion]
                    }
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex w-full justify-center gap-16">
              {Object.keys(SplittestVersion).map((version) => (
                <div key={version} className="flex flex-col items-center">
                  <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight">
                    {version}
                  </h2>
                  <LinkStatsSplittest
                    id={id}
                    statsRange={statsRange}
                    splittestVersion={
                      SplittestVersion[version as keyof typeof SplittestVersion]
                    }
                  />
                  <ConversionChartSplittest
                    id={id}
                    statsRange={statsRange}
                    splittestVersion={
                      SplittestVersion[version as keyof typeof SplittestVersion]
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          {statsRange === "alltime" ? (
            <>
              <LinkStatsAlltime id={id} />
              <ConversionChartAlltime id={id} />
            </>
          ) : statsRange === "custom" ? (
            <>
              <LinkStatsRange id={id} date={date} />
              <ConversionChartRange id={id} date={date} />
            </>
          ) : (
            <>
              <LinkStats id={id} statsRange={statsRange} />
              <ConversionChart id={id} statsRange={statsRange} />
            </>
          )}
        </>
      )}
    </div>
  );
}

function LinkStats({ id, statsRange }: { id: string; statsRange: string }) {
  const [stats] = api.linkstats.getRange.useSuspenseQuery({
    linkId: id,
    days: Number(statsRange),
  });

  const visitsDifference = stats.visits - stats.visitsBefore;
  const clicksDifference = stats.clicks - stats.clicksBefore;
  const conversionRateDifference =
    stats.conversionRate - stats.conversionRateBefore;

  const betterVisits = visitsDifference > 0;
  const betterClicks = clicksDifference > 0;
  const betterConversionRate = conversionRateDifference > 0;

  return (
    <section className="group/container relative mx-auto w-full max-w-7xl overflow-hidden rounded-3xl p-10">
      <div className="relative z-20">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-3">
          {/* Visits */}
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
              <p>Aufrufe</p>
              <p className="text-3xl font-bold text-neutral-700 dark:text-neutral-200">
                <AnimatedNumber value={stats.visits} />
              </p>
              <p
                className={`text-xs italic ${betterVisits ? "text-green-500" : "text-red-500"}`}
              >
                {betterVisits ? `+${visitsDifference}` : visitsDifference}
              </p>
            </div>
          </motion.div>

          {/* Clicks */}
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
              <p>Klicks</p>
              <p className="text-3xl font-bold text-neutral-700 dark:text-neutral-200">
                <AnimatedNumber value={stats.clicks} />
              </p>
              <p
                className={`text-xs italic ${betterClicks ? "text-green-500" : "text-red-500"}`}
              >
                {betterClicks ? `+${clicksDifference}` : clicksDifference}
              </p>
            </div>
          </motion.div>

          {/* Conversion */}
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
              <p>Conversion-Rate</p>
              <p className="text-3xl font-bold text-neutral-700 dark:text-neutral-200">
                <AnimatedNumber
                  value={
                    isNaN(stats.conversionRate)
                      ? 0
                      : stats.conversionRate.toFixed(2)
                  }
                />
                %
              </p>
              <p
                className={`text-xs italic ${betterConversionRate ? "text-green-500" : "text-red-500"}`}
              >
                {betterConversionRate
                  ? `+${isNaN(conversionRateDifference) ? 0 : conversionRateDifference.toFixed(2)}`
                  : isNaN(conversionRateDifference)
                    ? 0
                    : conversionRateDifference.toFixed(2)}
                %
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function LinkStatsRange({ id, date }: { id: string; date: DateRange | undefined }) {
  const [stats] = api.linkstats.getRangeDate.useSuspenseQuery({
    linkId: id,
    startDate: date?.from,
    endDate: date?.to
  });

  return (
    <section className="group/container relative mx-auto w-full max-w-7xl overflow-hidden rounded-3xl p-10">
      <div className="relative z-20">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-3">
          {/* Visits */}
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
              <p>Aufrufe</p>
              <p className="text-3xl font-bold text-neutral-700 dark:text-neutral-200">
                <AnimatedNumber value={stats.visits} />
              </p>
            </div>
          </motion.div>

          {/* Clicks */}
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
              <p>Klicks</p>
              <p className="text-3xl font-bold text-neutral-700 dark:text-neutral-200">
                <AnimatedNumber value={stats.clicks} />
              </p>
            </div>
          </motion.div>

          {/* Conversion */}
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
              <p>Conversion-Rate</p>
              <p className="text-3xl font-bold text-neutral-700 dark:text-neutral-200">
                <AnimatedNumber
                  value={
                    isNaN(stats.conversionRate)
                      ? 0
                      : stats.conversionRate.toFixed(2)
                  }
                />
                %
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function LinkStatsSplittest({
  id,
  statsRange,
  splittestVersion,
}: {
  id: string;
  statsRange: string;
  splittestVersion: SplittestVersion;
}) {
  const [stats] = api.linkstats.getRangeSplittest.useSuspenseQuery({
    linkId: id,
    days: Number(statsRange),
    splittestVersion,
  });

  const visitsDifference = stats.visits - stats.visitsBefore;
  const clicksDifference = stats.clicks - stats.clicksBefore;
  const conversionRateDifference =
    stats.conversionRate - stats.conversionRateBefore;

  const betterVisits = visitsDifference > 0;
  const betterClicks = clicksDifference > 0;
  const betterConversionRate = conversionRateDifference > 0;

  return (
    <section className="group/container relative mx-auto w-full max-w-7xl overflow-hidden rounded-3xl p-10">
      <div className="relative z-20">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-3">
          {/* Visits */}
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
              <p>Aufrufe</p>
              <p className="text-3xl font-bold text-neutral-700 dark:text-neutral-200">
                <AnimatedNumber value={stats.visits} />
              </p>
              <p
                className={`text-xs italic ${betterVisits ? "text-green-500" : "text-red-500"}`}
              >
                {betterVisits ? `+${visitsDifference}` : visitsDifference}
              </p>
            </div>
          </motion.div>

          {/* Clicks */}
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
              <p>Klicks</p>
              <p className="text-3xl font-bold text-neutral-700 dark:text-neutral-200">
                <AnimatedNumber value={stats.clicks} />
              </p>
              <p
                className={`text-xs italic ${betterClicks ? "text-green-500" : "text-red-500"}`}
              >
                {betterClicks ? `+${clicksDifference}` : clicksDifference}
              </p>
            </div>
          </motion.div>

          {/* Conversion */}
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
              <p>Conversion-Rate</p>
              <p className="text-3xl font-bold text-neutral-700 dark:text-neutral-200">
                <AnimatedNumber
                  value={
                    isNaN(stats.conversionRate)
                      ? 0
                      : stats.conversionRate.toFixed(2)
                  }
                />
                %
              </p>
              <p
                className={`text-xs italic ${betterConversionRate ? "text-green-500" : "text-red-500"}`}
              >
                {betterConversionRate
                  ? `+${isNaN(conversionRateDifference) ? 0 : conversionRateDifference.toFixed(2)}`
                  : isNaN(conversionRateDifference)
                    ? 0
                    : conversionRateDifference.toFixed(2)}
                %
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function LinkStatsRangeSplittest({
  id,
  date,
  splittestVersion,
}: {
  id: string;
  date: DateRange | undefined;
  splittestVersion: SplittestVersion;
}) {
  const [stats] = api.linkstats.getRangeDateSplittest.useSuspenseQuery({
    linkId: id,
    startDate: date?.from,
    endDate: date?.to,
    splittestVersion,
  });

  return (
    <section className="group/container relative mx-auto w-full max-w-7xl overflow-hidden rounded-3xl p-10">
      <div className="relative z-20">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-3">
          {/* Visits */}
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
              <p>Aufrufe</p>
              <p className="text-3xl font-bold text-neutral-700 dark:text-neutral-200">
                <AnimatedNumber value={stats.visits} />
              </p>
            </div>
          </motion.div>

          {/* Clicks */}
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
              <p>Klicks</p>
              <p className="text-3xl font-bold text-neutral-700 dark:text-neutral-200">
                <AnimatedNumber value={stats.clicks} />
              </p>
            </div>
          </motion.div>

          {/* Conversion */}
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
              <p>Conversion-Rate</p>
              <p className="text-3xl font-bold text-neutral-700 dark:text-neutral-200">
                <AnimatedNumber
                  value={
                    isNaN(stats.conversionRate)
                      ? 0
                      : stats.conversionRate.toFixed(2)
                  }
                />
                %
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function LinkStatsAlltime({ id }: { id: string }) {
  const [stats] = api.linkstats.get.useSuspenseQuery({
    linkId: id,
  });

  return (
    <section className="group/container relative mx-auto w-full max-w-7xl overflow-hidden rounded-3xl p-10">
      <div className="relative z-20">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-3">
          {/* Visits */}
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
              <p>Aufrufe</p>
              <p className="text-3xl font-bold text-neutral-700 dark:text-neutral-200">
                <AnimatedNumber value={stats.visits} />
              </p>
            </div>
          </motion.div>

          {/* Clicks */}
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
              <p>Klicks</p>
              <p className="text-3xl font-bold text-neutral-700 dark:text-neutral-200">
                <AnimatedNumber value={stats.clicks} />
              </p>
            </div>
          </motion.div>

          {/* Conversion */}
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
              <p>Conversion-Rate</p>
              <p className="text-3xl font-bold text-neutral-700 dark:text-neutral-200">
                <AnimatedNumber
                  value={
                    isNaN(stats.conversionRate)
                      ? 0
                      : stats.conversionRate.toFixed(2)
                  }
                />
                %
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function LinkStatsAlltimeSplittest({
  id,
  splittestVersion,
}: {
  id: string;
  splittestVersion: SplittestVersion;
}) {
  const [stats] = api.linkstats.getSplittest.useSuspenseQuery({
    linkId: id,
    splittestVersion,
  });

  return (
    <section className="group/container relative mx-auto w-full max-w-7xl overflow-hidden rounded-3xl p-10">
      <div className="relative z-20">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-3">
          {/* Visits */}
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
              <p>Aufrufe</p>
              <p className="text-3xl font-bold text-neutral-700 dark:text-neutral-200">
                <AnimatedNumber value={stats.visits} />
              </p>
            </div>
          </motion.div>

          {/* Clicks */}
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
              <p>Klicks</p>
              <p className="text-3xl font-bold text-neutral-700 dark:text-neutral-200">
                <AnimatedNumber value={stats.clicks} />
              </p>
            </div>
          </motion.div>

          {/* Conversion */}
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
              <p>Conversion-Rate</p>
              <p className="text-3xl font-bold text-neutral-700 dark:text-neutral-200">
                <AnimatedNumber
                  value={
                    isNaN(stats.conversionRate)
                      ? 0
                      : stats.conversionRate.toFixed(2)
                  }
                />
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

const chartConfig = {
  conversionRate: {
    label: "Aktuell",
    color: "hsl(var(--chart-2))",
  },
  lastConversion: {
    label: "Vergangene Woche",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;

function ConversionChart({
  id,
  statsRange,
}: {
  id: string;
  statsRange: string;
}) {
  const [conversions] = api.linkstats.getDailyConversionRates.useSuspenseQuery({
    linkId: id,
    days: Number(statsRange),
  });

  const sortedConversions = conversions.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const lastDays = sortedConversions.slice(0, Number(statsRange));
  const lastDaysBefore = sortedConversions.slice(
    Number(statsRange),
    Number(statsRange) * 2,
  );

  const combinedConversions = lastDays.map((conversion, index) => {
    const lastConversion = lastDaysBefore[index]?.conversionRate ?? 0;

    return {
      ...conversion,
      lastConversion: Number(lastConversion),
      maxConversion: 100,
    };
  });

  const newCombinedConversion = combinedConversions.reverse();
  const averageConversion =
    newCombinedConversion.reduce(
      (sum, conversion) => sum + conversion.conversionRate,
      0,
    ) / newCombinedConversion.length;
  const averageLastConversion =
    newCombinedConversion.reduce(
      (sum, conversion) => sum + conversion.lastConversion,
      0,
    ) / newCombinedConversion.length;
  const trendPercentage =
    ((averageConversion - averageLastConversion) / averageLastConversion) * 100;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Conversions - Wochenvergleich</CardTitle>
        <CardDescription>Diese Woche vs Vorherige Woche</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={newCombinedConversion}
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
              dataKey="maxConversion"
              tickLine={true}
              axisLine={true}
              tickMargin={8}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="conversionRate"
              type="monotone"
              stroke="var(--color-conversionRate)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="lastConversion"
              type="monotone"
              stroke="var(--color-lastConversion)"
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
                      Die Durchschnittsconversions der Woche sind zu{" "}
                      {Math.abs(trendPercentage).toFixed(2)}% niedriger als
                      vergangene Woche{" "}
                      <TrendingDown className="h-4 w-4 text-red-400" />
                    </>
                  ) : (
                    <>
                      Die Durchschnittsconversions der Woche sind zu{" "}
                      {Math.abs(trendPercentage).toFixed(2)}% höher als
                      vergangene Woche{" "}
                      <TrendingUp className="h-4 w-4 text-green-400" />
                    </>
                  )}
                </>
              ) : (
                <p>Es wurden noch nicht genügen Daten gesammelt</p>
              )}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

function ConversionChartSplittest({
  id,
  statsRange,
  splittestVersion,
}: {
  id: string;
  statsRange: string;
  splittestVersion: SplittestVersion;
}) {
  const [conversions] =
    api.linkstats.getDailyConversionRatesSplittest.useSuspenseQuery({
      linkId: id,
      days: Number(statsRange),
      splittestVersion,
    });

  const sortedConversions = conversions.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const lastDays = sortedConversions.slice(0, Number(statsRange));
  const lastDaysBefore = sortedConversions.slice(
    Number(statsRange),
    Number(statsRange) * 2,
  );

  const combinedConversions = lastDays.map((conversion, index) => {
    const lastConversion = lastDaysBefore[index]?.conversionRate ?? 0;

    return {
      ...conversion,
      lastConversion: Number(lastConversion),
      maxConversion: 100,
    };
  });

  const newCombinedConversion = combinedConversions.reverse();
  const averageConversion =
    newCombinedConversion.reduce(
      (sum, conversion) => sum + conversion.conversionRate,
      0,
    ) / newCombinedConversion.length;
  const averageLastConversion =
    newCombinedConversion.reduce(
      (sum, conversion) => sum + conversion.lastConversion,
      0,
    ) / newCombinedConversion.length;
  const trendPercentage =
    ((averageConversion - averageLastConversion) / averageLastConversion) * 100;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Conversions - Wochenvergleich</CardTitle>
        <CardDescription>Diese Woche vs Vorherige Woche</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={newCombinedConversion}
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
              dataKey="maxConversion"
              tickLine={true}
              axisLine={true}
              tickMargin={8}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="conversionRate"
              type="monotone"
              stroke="var(--color-conversionRate)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="lastConversion"
              type="monotone"
              stroke="var(--color-lastConversion)"
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
                      Die Durchschnittsconversions der Woche sind zu{" "}
                      {Math.abs(trendPercentage).toFixed(2)}% niedriger als
                      vergangene Woche{" "}
                      <TrendingDown className="h-4 w-4 text-red-400" />
                    </>
                  ) : (
                    <>
                      Die Durchschnittsconversions der Woche sind zu{" "}
                      {Math.abs(trendPercentage).toFixed(2)}% höher als
                      vergangene Woche{" "}
                      <TrendingUp className="h-4 w-4 text-green-400" />
                    </>
                  )}
                </>
              ) : (
                <p>Es wurden noch nicht genügen Daten gesammelt</p>
              )}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

const chartConfigAlltime = {
  conversionRate: {
    label: "Aktuell",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

function ConversionChartAlltime({ id }: { id: string }) {
  const [conversions] =
    api.linkstats.getAllTimeDailyConversionRates.useSuspenseQuery({
      linkId: id,
    });

  const sortedConversions = conversions.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const combinedConversions = sortedConversions.map((conversion) => {
    return {
      ...conversion,
      maxConversion: 100,
    };
  });

  const newCombinedConversion = combinedConversions.reverse();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Conversions - Wochenvergleich</CardTitle>
        <CardDescription>Deine alltime Conversions</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfigAlltime}>
          <LineChart
            accessibilityLayer
            data={newCombinedConversion}
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
              dataKey="maxConversion"
              tickLine={true}
              axisLine={true}
              tickMargin={8}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="conversionRate"
              type="monotone"
              stroke="var(--color-conversionRate)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function ConversionChartRange({ id, date }: { id: string; date: DateRange | undefined }) {
  const [conversions] =
    api.linkstats.getRangeDailyConversionRates.useSuspenseQuery({
      linkId: id,
      startDate: date?.from,
      endDate: date?.to
    });

  const sortedConversions = conversions.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const combinedConversions = sortedConversions.map((conversion) => {
    return {
      ...conversion,
      maxConversion: 100,
    };
  });

  const newCombinedConversion = combinedConversions.reverse();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Conversions - Wochenvergleich</CardTitle>
        <CardDescription>Deine Custom Conversions</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfigAlltime}>
          <LineChart
            accessibilityLayer
            data={newCombinedConversion}
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
              dataKey="maxConversion"
              tickLine={true}
              axisLine={true}
              tickMargin={8}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="conversionRate"
              type="monotone"
              stroke="var(--color-conversionRate)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function ConversionChartAlltimeSplittest({
  id,
  splittestVersion,
}: {
  id: string;
  splittestVersion: SplittestVersion;
}) {
  const [conversions] =
    api.linkstats.getAllTimeDailyConversionRatesSplittest.useSuspenseQuery({
      linkId: id,
      splittestVersion,
    });

  const sortedConversions = conversions.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const combinedConversions = sortedConversions.map((conversion) => {
    return {
      ...conversion,
      maxConversion: 100,
    };
  });

  const newCombinedConversion = combinedConversions.reverse();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Conversions - Wochenvergleich</CardTitle>
        <CardDescription>Deine alltime Conversions</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfigAlltime}>
          <LineChart
            accessibilityLayer
            data={newCombinedConversion}
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
              dataKey="maxConversion"
              tickLine={true}
              axisLine={true}
              tickMargin={8}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="conversionRate"
              type="monotone"
              stroke="var(--color-conversionRate)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function ConversionChartRangeSplittest({
  id,
  date,
  splittestVersion,
}: {
  id: string;
  date: DateRange | undefined;
  splittestVersion: SplittestVersion;
}) {
  const [conversions] =
    api.linkstats.getRangeDailyConversionRatesSplittest.useSuspenseQuery({
      linkId: id,
      startDate: date?.from,
      endDate: date?.to,
      splittestVersion,
    });

  const sortedConversions = conversions.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const combinedConversions = sortedConversions.map((conversion) => {
    return {
      ...conversion,
      maxConversion: 100,
    };
  });

  const newCombinedConversion = combinedConversions.reverse();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Conversions - Wochenvergleich</CardTitle>
        <CardDescription>Deine Custom Conversions</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfigAlltime}>
          <LineChart
            accessibilityLayer
            data={newCombinedConversion}
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
              dataKey="maxConversion"
              tickLine={true}
              axisLine={true}
              tickMargin={8}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="conversionRate"
              type="monotone"
              stroke="var(--color-conversionRate)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
