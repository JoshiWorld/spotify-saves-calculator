"use client";

import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"
import { api } from "@/trpc/react";
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useEffect, useRef, useState } from "react";
import { motion, useInView, useSpring, useTransform } from "framer-motion";
import { LoadingDots } from "@/components/ui/loading";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlaylistAnalyseOverviewChartView } from "./PlaylistAnalyseOverviewChart";

const MotionCard = motion.create(Card);

export function PlaylistAnalyseCards() {
  const { data: stats } =
    api.playlistAnalyse.getAggregatedStatsForUserWithComparison.useQuery({
      days: Number(28),
    });

  const followsDifference = stats ? stats.follows - stats.followsBefore : 0;
  const gainedDifference = stats ? stats.gained - stats.gainedBefore : 0;
  const lostDifference = stats ? stats.lost - stats.lostBefore : 0;

  const betterFollows = followsDifference > 0;
  const betterGained = gainedDifference > 0;
  const betterLost = lostDifference > 0;

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
      <MotionCard
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
        className="@container/card"
      >
        <CardHeader>
          <CardDescription>Follows</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats ? <AnimatedNumber value={stats.follows} /> : <LoadingDots align="start" />}
          </CardTitle>
          <CardAction>
            {betterFollows ? (
              <Badge variant="outline">
                <IconTrendingUp />
                +<AnimatedNumber value={followsDifference} />
              </Badge>
            ) : (
              <Badge variant="outline">
                <IconTrendingDown />
                <AnimatedNumber value={followsDifference} />
              </Badge>
            )}
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          {betterFollows ? (
            <div className="line-clamp-1 flex gap-2 font-medium">
              Aufwärtstrend <IconTrendingUp className="size-4" />
            </div>
          ) : (
            <div className="line-clamp-1 flex gap-2 font-medium">
              Abwärtstrend <IconTrendingDown className="size-4" />
            </div>
          )}
          <div className="text-muted-foreground">
            Follows der letzten 28 Tage
          </div>
        </CardFooter>
      </MotionCard>
      <MotionCard
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
        className="@container/card"
      >
        <CardHeader>
          <CardDescription>Follows Gained</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats ? <AnimatedNumber value={stats.gained} /> : <LoadingDots align="start" />}
          </CardTitle>
          <CardAction>
            {betterGained ? (
              <Badge variant="outline">
                <IconTrendingUp />
                +<AnimatedNumber value={gainedDifference} />
              </Badge>
            ) : (
              <Badge variant="outline">
                <IconTrendingDown />
                <AnimatedNumber value={gainedDifference} />
              </Badge>
            )}
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          {betterGained ? (
            <div className="line-clamp-1 flex gap-2 font-medium">
              Aufwärtstrend <IconTrendingUp className="size-4" />
            </div>
          ) : (
            <div className="line-clamp-1 flex gap-2 font-medium">
              Abwärtstrend <IconTrendingDown className="size-4" />
            </div>
          )}
          <div className="text-muted-foreground">
            Follows Gained der letzten 28 Tage
          </div>
        </CardFooter>
      </MotionCard>
      <MotionCard
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
        key={"conversionrate"}
        className="@container/card"
      >
        <CardHeader>
          <CardDescription>Follows Lost</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats ? <AnimatedNumber value={stats.lost} /> : <LoadingDots align="start" />}%
          </CardTitle>
          <CardAction>
            {betterLost ? (
              <Badge variant="outline">
                <IconTrendingDown />
                <AnimatedNumber value={lostDifference} />
              </Badge>
            ) : (
              <Badge variant="outline">
                <IconTrendingUp />
                +<AnimatedNumber value={lostDifference} />
              </Badge>
            )}
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          {betterLost ? (
            <div className="line-clamp-1 flex gap-2 font-medium">
              Abwärtstrend <IconTrendingDown className="size-4" />
            </div>
          ) : (
            <div className="line-clamp-1 flex gap-2 font-medium">
              Aufwärtstrend <IconTrendingUp className="size-4" />
            </div>
          )}
          <div className="text-muted-foreground">
            Follows Lost der letzten 28 Tage
          </div>
        </CardFooter>
      </MotionCard>

    </div>
  )
}

export function PlaylistAnalyseStatsCardView({ id }: { id: string }) {
  const [statsRange, setStatsRange] = useState<string>("28");

  const { data: stats } = api.playlistAnalyse.getRange.useQuery({
    playlistId: id,
    days: Number(statsRange),
  });

  const followsDifference = stats ? stats.follows - stats.followsBefore : 0;
  const gainedDifference = stats ? stats.gained - stats.gainedBefore : 0;
  const lostDifference = stats ? stats.lost - stats.lostBefore : 0;

  const betterFollows = followsDifference > 0;
  const betterGained = gainedDifference > 0;
  const betterLost = lostDifference > 0;

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <Select onValueChange={setStatsRange} value={statsRange}>
        <SelectTrigger className="flex items-center justify-center mx-auto w-[150px]">
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

      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
        <MotionCard
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
          className="@container/card"
        >
          <CardHeader>
            <CardDescription>Follows</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {stats ? <AnimatedNumber value={stats.follows} /> : <LoadingDots align="start" />}
            </CardTitle>
            <CardAction>
              {betterFollows ? (
                <Badge variant="outline">
                  <IconTrendingUp />
                  +<AnimatedNumber value={followsDifference} />
                </Badge>
              ) : (
                <Badge variant="outline">
                  <IconTrendingDown />
                  <AnimatedNumber value={followsDifference} />
                </Badge>
              )}
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            {betterFollows ? (
              <div className="line-clamp-1 flex gap-2 font-medium">
                Aufwärtstrend <IconTrendingUp className="size-4" />
              </div>
            ) : (
              <div className="line-clamp-1 flex gap-2 font-medium">
                Abwärtstrend <IconTrendingDown className="size-4" />
              </div>
            )}
            <div className="text-muted-foreground">
              Follows der letzten {statsRange} Tage
            </div>
          </CardFooter>
        </MotionCard>
        <MotionCard
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
          className="@container/card"
        >
          <CardHeader>
            <CardDescription>Follows Gained</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {stats ? <AnimatedNumber value={stats.gained} /> : <LoadingDots align="start" />}
            </CardTitle>
            <CardAction>
              {betterGained ? (
                <Badge variant="outline">
                  <IconTrendingUp />
                  +<AnimatedNumber value={gainedDifference} />
                </Badge>
              ) : (
                <Badge variant="outline">
                  <IconTrendingDown />
                  <AnimatedNumber value={gainedDifference} />
                </Badge>
              )}
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            {gainedDifference ? (
              <div className="line-clamp-1 flex gap-2 font-medium">
                Aufwärtstrend <IconTrendingUp className="size-4" />
              </div>
            ) : (
              <div className="line-clamp-1 flex gap-2 font-medium">
                Abwärtstrend <IconTrendingDown className="size-4" />
              </div>
            )}
            <div className="text-muted-foreground">
              Follows Gained der letzten {statsRange} Tage
            </div>
          </CardFooter>
        </MotionCard>
        <MotionCard
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
          key={"conversionrate"}
          className="@container/card"
        >
          <CardHeader>
            <CardDescription>Follows Lost</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {stats ? <AnimatedNumber value={stats.lost} /> : <LoadingDots align="start" />}
            </CardTitle>
            <CardAction>
              {betterLost ? (
                <Badge variant="outline">
                  <IconTrendingDown />
                  <AnimatedNumber value={lostDifference} />
                </Badge>
              ) : (
                <Badge variant="outline">
                  <IconTrendingUp />
                  +<AnimatedNumber value={lostDifference} />
                </Badge>
              )}
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            {betterLost ? (
              <div className="line-clamp-1 flex gap-2 font-medium">
                Abwärtstrend <IconTrendingDown className="size-4" />
              </div>
            ) : (
              <div className="line-clamp-1 flex gap-2 font-medium">
                Aufwärtstrend <IconTrendingUp className="size-4" />
              </div>
            )}
            <div className="text-muted-foreground">
              Follows Lost der letzten {statsRange} Tage
            </div>
          </CardFooter>
        </MotionCard>
      </div>

      <div className="px-4 lg:px-6">
        <PlaylistAnalyseOverviewChartView id={id} statsRange={statsRange} />
      </div>
    </div>
  )
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
