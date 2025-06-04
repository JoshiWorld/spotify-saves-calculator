"use client";

import { api } from "@/trpc/react";
import { cn } from "@/lib/utils";
import React, { useRef } from "react";
import { motion, useInView, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

export function PlaylistAnalyseStats() {
  const [stats] =
    api.playlistAnalyse.getAllStats.useSuspenseQuery({
      days: Number(7),
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
