"use client";

import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
    Card,
    CardAction,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { useEffect, useRef } from "react";
import { motion, useInView, useSpring, useTransform } from "framer-motion";
import { LoadingDots } from "@/components/ui/loading";
import { api } from "@/trpc/react";

const MotionCard = motion.create(Card);

export function DashboardCards() {
    const { data } = api.dashboard.getDashboardCards.useQuery();

    const betterConversionRate = data ? data.conversionRateBefore > 0 : false;
    const betterFollows = data ? data.playlistFollowsBefore > 0 : false;
    const betterCPS = data ? data.cpsBefore > 0 : false;

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
                    delay: 3 * 0.1,
                }}
                key={"conversionrate"}
                className="@container/card"
            >
                <CardHeader>
                    <CardDescription>Smartlinks Conversionrate</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {data ? <AnimatedNumber value={data.conversionRate} /> : <LoadingDots align="start" />}%
                    </CardTitle>
                    <CardAction>
                        {betterConversionRate ? (
                            <Badge variant="outline">
                                <IconTrendingUp />
                                +<AnimatedNumber value={data?.conversionRateBefore ?? 0} />%
                            </Badge>
                        ) : (
                            <Badge variant="outline">
                                <IconTrendingDown />
                                <AnimatedNumber value={data?.conversionRateBefore ?? 0} />%
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
                        Conversionrate der letzten 7 Tage
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
                key={"cps"}
                className="@container/card"
            >
                <CardHeader>
                    <CardDescription>Saves-Calculator CPS</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {data ? <AnimatedNumber value={data.cps} /> : <LoadingDots align="start" />}€
                    </CardTitle>
                    <CardAction>
                        {betterCPS ? (
                            <Badge variant="outline">
                                <IconTrendingUp />
                                +<AnimatedNumber value={data?.cpsBefore ?? 0} />%
                            </Badge>
                        ) : (
                            <Badge variant="outline">
                                <IconTrendingDown />
                                <AnimatedNumber value={data?.cpsBefore ?? 0} />%
                            </Badge>
                        )}
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    {betterCPS ? (
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            Aufwärtstrend <IconTrendingUp className="size-4" />
                        </div>
                    ) : (
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            Abwärtstrend <IconTrendingDown className="size-4" />
                        </div>
                    )}
                    <div className="text-muted-foreground">
                        CPS der letzten 7 Tage
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
                key={"playlistGrowth"}
                className="@container/card"
            >
                <CardHeader>
                    <CardDescription>Playlist Follows</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {data ? <AnimatedNumber value={data.playlistFollows} /> : <LoadingDots align="start" />}
                    </CardTitle>
                    <CardAction>
                        {betterFollows ? (
                            <Badge variant="outline">
                                <IconTrendingUp />
                                +<AnimatedNumber value={data?.playlistFollowsBefore ?? 0} />%
                            </Badge>
                        ) : (
                            <Badge variant="outline">
                                <IconTrendingDown />
                                <AnimatedNumber value={data?.playlistFollowsBefore ?? 0} />%
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
                        Follows der letzten 7 Tage
                    </div>
                </CardFooter>
            </MotionCard>
        </div>
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
    const formatter = new Intl.NumberFormat("de-DE", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });

    const display = useTransform(spring, (current) =>
        formatter.format(current)
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