"use client";

import { api } from "@/trpc/react";
import { cn } from "@/lib/utils";
import React, { useRef } from "react";
import { motion, useInView, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

export function Stats() {
  const [stats] =
    api.linkstats.getAggregatedStatsForUserWithComparison.useSuspenseQuery({
      days: Number(28),
    });

  const visitsDifference = stats.visits - stats.visitsBefore;
  const clicksDifference = stats.clicks - stats.clicksBefore;
  const conversionRateDifference = stats.conversionRate - stats.conversionRateBefore;

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
                <AnimatedNumber value={stats.conversionRate.toFixed(2)} />%
              </p>
              <p
                className={`text-xs italic ${betterConversionRate ? "text-green-500" : "text-red-500"}`}
              >
                {betterConversionRate
                  ? `+${conversionRateDifference.toFixed(2)}`
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
