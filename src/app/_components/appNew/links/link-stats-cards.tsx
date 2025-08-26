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
import { LinkStatsOverviewChartView } from "./link-stats-overview-chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MotionCard = motion.create(Card);

export function LinkStatsCards() {
    const { data: stats } = api.linkstats.getAggregatedStatsForUserWithComparison.useQuery({
        days: Number(28),
    });

    const visitsDifference = stats ? stats.visits - stats.visitsBefore : 0;
    const clicksDifference = stats ? stats.clicks - stats.clicksBefore : 0;
    const conversionRateDifference = stats ? stats.conversionRate - stats.conversionRateBefore : 0;

    const betterVisits = visitsDifference > 0;
    const betterClicks = clicksDifference > 0;
    const betterConversionRate = conversionRateDifference > 0;

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
                    <CardDescription>Aufrufe</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {stats ? <AnimatedNumber value={stats.visits} /> : <LoadingDots align="start" />}
                    </CardTitle>
                    <CardAction>
                        {betterVisits ? (
                            <Badge variant="outline">
                                <IconTrendingUp />
                                +<AnimatedNumber value={visitsDifference} />
                            </Badge>
                        ) : (
                            <Badge variant="outline">
                                <IconTrendingDown />
                                <AnimatedNumber value={visitsDifference} />
                            </Badge>
                        )}
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    {betterVisits ? (
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            Aufwärtstrend <IconTrendingUp className="size-4" />
                        </div>
                    ) : (
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            Abwärtstrend <IconTrendingDown className="size-4" />
                        </div>
                    )}
                    <div className="text-muted-foreground">
                        Aufrufe der letzten 28 Tage
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
                    <CardDescription>Klicks</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {stats ? <AnimatedNumber value={stats.clicks} /> : <LoadingDots align="start" />}
                    </CardTitle>
                    <CardAction>
                        {betterClicks ? (
                            <Badge variant="outline">
                                <IconTrendingUp />
                                +<AnimatedNumber value={clicksDifference} />
                            </Badge>
                        ) : (
                            <Badge variant="outline">
                                <IconTrendingDown />
                                <AnimatedNumber value={clicksDifference} />
                            </Badge>
                        )}
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    {betterClicks ? (
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            Aufwärtstrend <IconTrendingUp className="size-4" />
                        </div>
                    ) : (
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            Abwärtstrend <IconTrendingDown className="size-4" />
                        </div>
                    )}
                    <div className="text-muted-foreground">
                        Klicks der letzten 28 Tage
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
                    <CardDescription>Conversionrate</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {stats ? <AnimatedNumber value={stats.conversionRate} /> : <LoadingDots align="start" />}%
                    </CardTitle>
                    <CardAction>
                        {betterConversionRate ? (
                            <Badge variant="outline">
                                <IconTrendingUp />
                                +<AnimatedNumber value={conversionRateDifference} />%
                            </Badge>
                        ) : (
                            <Badge variant="outline">
                                <IconTrendingDown />
                                <AnimatedNumber value={conversionRateDifference} />%
                            </Badge>
                        )}
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    {betterConversionRate ? (
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            Aufwärtstrend <IconTrendingUp className="size-4" />
                        </div>
                    ) : (
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            Abwärtstrend <IconTrendingDown className="size-4" />
                        </div>
                    )}
                    <div className="text-muted-foreground">
                        Conversionrate der letzten 28 Tage
                    </div>
                </CardFooter>
            </MotionCard>

        </div>
    )
}



export function LinkStatsCardView({ id }: { id: string }) {
    const [statsRange, setStatsRange] = useState<string>("28");

    const { data: stats } = api.linkstats.getRange.useQuery({
        linkId: id,
        days: Number(statsRange),
    });

    const visitsDifference = stats ? stats.visits - stats.visitsBefore : 0;
    const clicksDifference = stats ? stats.clicks - stats.clicksBefore : 0;
    const conversionRateDifference = stats ? stats.conversionRate - stats.conversionRateBefore : 0;

    const betterVisits = visitsDifference > 0;
    const betterClicks = clicksDifference > 0;
    const betterConversionRate = conversionRateDifference > 0;

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
                        <CardDescription>Aufrufe</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                            {stats ? <AnimatedNumber value={stats.visits} /> : <LoadingDots align="start" />}
                        </CardTitle>
                        <CardAction>
                            {betterVisits ? (
                                <Badge variant="outline">
                                    <IconTrendingUp />
                                    +<AnimatedNumber value={visitsDifference} />
                                </Badge>
                            ) : (
                                <Badge variant="outline">
                                    <IconTrendingDown />
                                    <AnimatedNumber value={visitsDifference} />
                                </Badge>
                            )}
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        {betterVisits ? (
                            <div className="line-clamp-1 flex gap-2 font-medium">
                                Aufwärtstrend <IconTrendingUp className="size-4" />
                            </div>
                        ) : (
                            <div className="line-clamp-1 flex gap-2 font-medium">
                                Abwärtstrend <IconTrendingDown className="size-4" />
                            </div>
                        )}
                        <div className="text-muted-foreground">
                            Aufrufe der letzten {statsRange} Tage
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
                        <CardDescription>Klicks</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                            {stats ? <AnimatedNumber value={stats.clicks} /> : <LoadingDots align="start" />}
                        </CardTitle>
                        <CardAction>
                            {betterClicks ? (
                                <Badge variant="outline">
                                    <IconTrendingUp />
                                    +<AnimatedNumber value={clicksDifference} />
                                </Badge>
                            ) : (
                                <Badge variant="outline">
                                    <IconTrendingDown />
                                    <AnimatedNumber value={clicksDifference} />
                                </Badge>
                            )}
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        {betterClicks ? (
                            <div className="line-clamp-1 flex gap-2 font-medium">
                                Aufwärtstrend <IconTrendingUp className="size-4" />
                            </div>
                        ) : (
                            <div className="line-clamp-1 flex gap-2 font-medium">
                                Abwärtstrend <IconTrendingDown className="size-4" />
                            </div>
                        )}
                        <div className="text-muted-foreground">
                            Klicks der letzten {statsRange} Tage
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
                        <CardDescription>Conversionrate</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                            {stats ? <AnimatedNumber value={stats.conversionRate} /> : <LoadingDots align="start" />}%
                        </CardTitle>
                        <CardAction>
                            {betterConversionRate ? (
                                <Badge variant="outline">
                                    <IconTrendingUp />
                                    +<AnimatedNumber value={conversionRateDifference} />%
                                </Badge>
                            ) : (
                                <Badge variant="outline">
                                    <IconTrendingDown />
                                    <AnimatedNumber value={conversionRateDifference} />%
                                </Badge>
                            )}
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        {betterConversionRate ? (
                            <div className="line-clamp-1 flex gap-2 font-medium">
                                Aufwärtstrend <IconTrendingUp className="size-4" />
                            </div>
                        ) : (
                            <div className="line-clamp-1 flex gap-2 font-medium">
                                Abwärtstrend <IconTrendingDown className="size-4" />
                            </div>
                        )}
                        <div className="text-muted-foreground">
                            Conversionrate der letzten {statsRange} Tage
                        </div>
                    </CardFooter>
                </MotionCard>
            </div>

            <div className="px-4 lg:px-6">
                <LinkStatsOverviewChartView id={id} statsRange={statsRange} />
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