"use client";

import { api } from "@/trpc/react";
import { cn } from "@/lib/utils";
import React, { useRef } from "react";
import { motion, useInView, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";
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

export function LinkStats({ id }: { id: string }) {
  const [visits] = api.linkstats.getLinkVisits.useSuspenseQuery({id});
  const [clicks] = api.linkstats.getLinkClicks.useSuspenseQuery({id});

  const conversionRate = (clicks.totalActions / visits.totalActions) * 100;
  const conversionRateBefore =
    (clicks.totalActionsBefore / visits.totalActionsBefore) * 100;

  const visitsDifference = visits.totalActions - visits.totalActionsBefore;
  const clicksDifference = clicks.totalActions - clicks.totalActionsBefore;
  const conversionRateDifference = conversionRate - conversionRateBefore;

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
              delay: 1*0.1,
            }}
            key={"card"}
            className={cn("group/card relative overflow-hidden rounded-lg")}
          >
            <div className="flex flex-col items-center gap-2">
              <p>Aufrufe</p>
              <p className="text-3xl font-bold text-neutral-700 dark:text-neutral-200">
                <AnimatedNumber value={visits.totalActions} />
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
              delay: 2*0.1,
            }}
            key={"card"}
            className={cn("group/card relative overflow-hidden rounded-lg")}
          >
            <div className="flex flex-col items-center gap-2">
              <p>Klicks</p>
              <p className="text-3xl font-bold text-neutral-700 dark:text-neutral-200">
                <AnimatedNumber value={clicks.totalActions} />
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
              delay: 3*0.1,
            }}
            key={"card"}
            className={cn("group/card relative overflow-hidden rounded-lg")}
          >
            <div className="flex flex-col items-center gap-2">
              <p>Conversion-Rate</p>
              <p className="text-3xl font-bold text-neutral-700 dark:text-neutral-200">
                <AnimatedNumber value={conversionRate.toFixed(2)} />%
              </p>
              <p
                className={`text-xs italic ${betterConversionRate ? "text-green-500" : "text-red-500"}`}
              >
                {betterConversionRate
                  ? `+${conversionRateDifference.toFixed(2)}`
                  : conversionRateDifference.toFixed(2)}%
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
  conversion: {
    label: "Aktuell",
    color: "hsl(var(--chart-2))",
  },
  lastConversion: {
    label: "Vergangene Woche",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;

export function ConversionChart({ id }: { id: string }) {
  const [conversions] = api.linkstats.getConversion.useSuspenseQuery({id});

  const sortedConversions = conversions.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const last7Days = sortedConversions.slice(0, 7);
  const last14Days = sortedConversions.slice(7, 14);

  const combinedConversions = last7Days.map((conversion, index) => {
    const lastConversion = last14Days[index]?.conversionRate ?? 0;

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
    <Card>
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
              stroke="var(--color-conversion)"
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
