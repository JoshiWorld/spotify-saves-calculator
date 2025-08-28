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
import { useEffect, useRef } from "react";
import { motion, useInView, useSpring, useTransform } from "framer-motion";
import { LoadingDots } from "@/components/ui/loading";

const MotionCard = motion.create(Card);

export function ProjectsStatsCards() {
    const { data: stats } = api.project.getStatsProjectView.useQuery({
        days: Number(28),
    });

    const budgetDifference = stats ? stats.budget - stats.budgetBefore : 0;
    const savesDifference = stats ? stats.saves - stats.savesBefore : 0;
    const cpsDifference = stats ? stats.cps - stats.cpsBefore : 0;

    const betterBudget = budgetDifference < 0;
    const betterSaves = savesDifference > 0;
    const betterCPS = cpsDifference < 0;

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
                key={"budget"}
                className="@container/card"
            >
                <CardHeader>
                    <CardDescription>Budget</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {stats ? <AnimatedNumber value={stats.budget.toFixed(2)} /> : <LoadingDots align="start" />}€
                    </CardTitle>
                    <CardAction>
                        {betterBudget ? (
                            <Badge variant="outline">
                                <IconTrendingUp />
                                +<AnimatedNumber value={budgetDifference} />
                            </Badge>
                        ) : (
                            <Badge variant="outline">
                                <IconTrendingDown />
                                <AnimatedNumber value={budgetDifference} />
                            </Badge>
                        )}
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    {betterBudget ? (
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            Abwärtstrend <IconTrendingUp className="size-4" />
                        </div>
                    ) : (
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            Aufwärtstrend <IconTrendingDown className="size-4" />
                        </div>
                    )}
                    <div className="text-muted-foreground">
                        Budget der letzten 28 Tage
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
                key={"saves"}
                className="@container/card"
            >
                <CardHeader>
                    <CardDescription>Saves</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {stats ? <AnimatedNumber value={stats.saves.toFixed(0)} /> : <LoadingDots align="start" />}
                    </CardTitle>
                    <CardAction>
                        {betterSaves ? (
                            <Badge variant="outline">
                                <IconTrendingUp />
                                +<AnimatedNumber value={savesDifference} />
                            </Badge>
                        ) : (
                            <Badge variant="outline">
                                <IconTrendingDown />
                                <AnimatedNumber value={savesDifference} />
                            </Badge>
                        )}
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    {betterSaves ? (
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            Aufwärtstrend <IconTrendingUp className="size-4" />
                        </div>
                    ) : (
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            Abwärtstrend <IconTrendingDown className="size-4" />
                        </div>
                    )}
                    <div className="text-muted-foreground">
                        Saves der letzten 28 Tage
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
                    <CardDescription>CPS</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {stats ? <AnimatedNumber value={stats.cps.toFixed(2)} /> : <LoadingDots align="start" />}€
                    </CardTitle>
                    <CardAction>
                        {betterCPS ? (
                            <Badge variant="outline">
                                <IconTrendingUp />
                                +<AnimatedNumber value={cpsDifference.toFixed(2)} />€
                            </Badge>
                        ) : (
                            <Badge variant="outline">
                                <IconTrendingDown />
                                <AnimatedNumber value={cpsDifference.toFixed(2)} />€
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
                        CPS der letzten 28 Tage
                    </div>
                </CardFooter>
            </MotionCard>

        </div>
    )
}


export function CampaignsStatsCards({ projectId }: { projectId: string }) {
    const { data: stats } = api.campaign.getStatsCampaignView.useQuery({
        days: Number(28),
        projectId
    });

    const budgetDifference = stats ? stats.budget - stats.budgetBefore : 0;
    const savesDifference = stats ? stats.saves - stats.savesBefore : 0;
    const cpsDifference = stats ? stats.cps - stats.cpsBefore : 0;

    const betterBudget = budgetDifference < 0;
    const betterSaves = savesDifference > 0;
    const betterCPS = cpsDifference < 0;

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
                key={"budget"}
                className="@container/card"
            >
                <CardHeader>
                    <CardDescription>Budget</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {stats ? <AnimatedNumber value={stats.budget.toFixed(2)} /> : <LoadingDots align="start" />}€
                    </CardTitle>
                    <CardAction>
                        {betterBudget ? (
                            <Badge variant="outline">
                                <IconTrendingUp />
                                +<AnimatedNumber value={budgetDifference} />
                            </Badge>
                        ) : (
                            <Badge variant="outline">
                                <IconTrendingDown />
                                <AnimatedNumber value={budgetDifference} />
                            </Badge>
                        )}
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    {betterBudget ? (
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            Abwärtstrend <IconTrendingUp className="size-4" />
                        </div>
                    ) : (
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            Aufwärtstrend <IconTrendingDown className="size-4" />
                        </div>
                    )}
                    <div className="text-muted-foreground">
                        Budget der letzten 28 Tage
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
                key={"saves"}
                className="@container/card"
            >
                <CardHeader>
                    <CardDescription>Saves</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {stats ? <AnimatedNumber value={stats.saves.toFixed(0)} /> : <LoadingDots align="start" />}
                    </CardTitle>
                    <CardAction>
                        {betterSaves ? (
                            <Badge variant="outline">
                                <IconTrendingUp />
                                +<AnimatedNumber value={savesDifference} />
                            </Badge>
                        ) : (
                            <Badge variant="outline">
                                <IconTrendingDown />
                                <AnimatedNumber value={savesDifference} />
                            </Badge>
                        )}
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    {betterSaves ? (
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            Aufwärtstrend <IconTrendingUp className="size-4" />
                        </div>
                    ) : (
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            Abwärtstrend <IconTrendingDown className="size-4" />
                        </div>
                    )}
                    <div className="text-muted-foreground">
                        Saves der letzten 28 Tage
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
                    <CardDescription>CPS</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {stats ? <AnimatedNumber value={stats.cps.toFixed(2)} /> : <LoadingDots align="start" />}€
                    </CardTitle>
                    <CardAction>
                        {betterCPS ? (
                            <Badge variant="outline">
                                <IconTrendingUp />
                                +<AnimatedNumber value={cpsDifference.toFixed(2)} />€
                            </Badge>
                        ) : (
                            <Badge variant="outline">
                                <IconTrendingDown />
                                <AnimatedNumber value={cpsDifference.toFixed(2)} />€
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
                        CPS der letzten 28 Tage
                    </div>
                </CardFooter>
            </MotionCard>

        </div>
    )
}


export function PostsStatsCards({ campaignId }: { campaignId: string }) {
    const { data: stats } = api.post.getStatsPostsView.useQuery({
        days: Number(28),
        campaignId
    });

    const budgetDifference = stats ? stats.budget - stats.budgetBefore : 0;
    const savesDifference = stats ? stats.saves - stats.savesBefore : 0;
    const cpsDifference = stats ? stats.cps - stats.cpsBefore : 0;

    const betterBudget = budgetDifference < 0;
    const betterSaves = savesDifference > 0;
    const betterCPS = cpsDifference < 0;

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
                key={"budget"}
                className="@container/card"
            >
                <CardHeader>
                    <CardDescription>Budget</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {stats ? <AnimatedNumber value={stats.budget.toFixed(2)} /> : <LoadingDots align="start" />}€
                    </CardTitle>
                    <CardAction>
                        {betterBudget ? (
                            <Badge variant="outline">
                                <IconTrendingUp />
                                +<AnimatedNumber value={budgetDifference} />
                            </Badge>
                        ) : (
                            <Badge variant="outline">
                                <IconTrendingDown />
                                <AnimatedNumber value={budgetDifference} />
                            </Badge>
                        )}
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    {betterBudget ? (
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            Abwärtstrend <IconTrendingUp className="size-4" />
                        </div>
                    ) : (
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            Aufwärtstrend <IconTrendingDown className="size-4" />
                        </div>
                    )}
                    <div className="text-muted-foreground">
                        Budget der letzten 28 Tage
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
                key={"saves"}
                className="@container/card"
            >
                <CardHeader>
                    <CardDescription>Saves</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {stats ? <AnimatedNumber value={stats.saves.toFixed(0)} /> : <LoadingDots align="start" />}
                    </CardTitle>
                    <CardAction>
                        {betterSaves ? (
                            <Badge variant="outline">
                                <IconTrendingUp />
                                +<AnimatedNumber value={savesDifference} />
                            </Badge>
                        ) : (
                            <Badge variant="outline">
                                <IconTrendingDown />
                                <AnimatedNumber value={savesDifference} />
                            </Badge>
                        )}
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    {betterSaves ? (
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            Aufwärtstrend <IconTrendingUp className="size-4" />
                        </div>
                    ) : (
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            Abwärtstrend <IconTrendingDown className="size-4" />
                        </div>
                    )}
                    <div className="text-muted-foreground">
                        Saves der letzten 28 Tage
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
                    <CardDescription>CPS</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {stats ? <AnimatedNumber value={stats.cps.toFixed(2)} /> : <LoadingDots align="start" />}€
                    </CardTitle>
                    <CardAction>
                        {betterCPS ? (
                            <Badge variant="outline">
                                <IconTrendingUp />
                                +<AnimatedNumber value={cpsDifference.toFixed(2)} />€
                            </Badge>
                        ) : (
                            <Badge variant="outline">
                                <IconTrendingDown />
                                <AnimatedNumber value={cpsDifference.toFixed(2)} />€
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
                        CPS der letzten 28 Tage
                    </div>
                </CardFooter>
            </MotionCard>

        </div>
    )
}

export function PostsStatsCardsAlltime({ campaignId }: { campaignId: string }) {
    const { data: stats } = api.post.getStatsPostsViewAlltime.useQuery({
        campaignId
    });

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
                key={"budget"}
                className="@container/card"
            >
                <CardHeader>
                    <CardDescription>Budget</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {stats ? <AnimatedNumber value={stats.budget.toFixed(2)} /> : <LoadingDots align="start" />}€
                    </CardTitle>
                    {/* <CardAction>
                        {betterBudget ? (
                            <Badge variant="outline">
                                <IconTrendingUp />
                                +<AnimatedNumber value={budgetDifference} />
                            </Badge>
                        ) : (
                            <Badge variant="outline">
                                <IconTrendingDown />
                                <AnimatedNumber value={budgetDifference} />
                            </Badge>
                        )}
                    </CardAction> */}
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    {/* {betterBudget ? (
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            Abwärtstrend <IconTrendingUp className="size-4" />
                        </div>
                    ) : (
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            Aufwärtstrend <IconTrendingDown className="size-4" />
                        </div>
                    )} */}
                    <div className="text-muted-foreground">
                        Budget der gesamten Laufzeit
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
                key={"saves"}
                className="@container/card"
            >
                <CardHeader>
                    <CardDescription>Saves</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {stats ? <AnimatedNumber value={stats.saves.toFixed(0)} /> : <LoadingDots align="start" />}
                    </CardTitle>
                    {/* <CardAction>
                        {betterSaves ? (
                            <Badge variant="outline">
                                <IconTrendingUp />
                                +<AnimatedNumber value={savesDifference} />
                            </Badge>
                        ) : (
                            <Badge variant="outline">
                                <IconTrendingDown />
                                <AnimatedNumber value={savesDifference} />
                            </Badge>
                        )}
                    </CardAction> */}
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    {/* {betterSaves ? (
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            Aufwärtstrend <IconTrendingUp className="size-4" />
                        </div>
                    ) : (
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            Abwärtstrend <IconTrendingDown className="size-4" />
                        </div>
                    )} */}
                    <div className="text-muted-foreground">
                        Saves der gesamten Laufzeit
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
                    <CardDescription>CPS</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {stats ? <AnimatedNumber value={stats.cps.toFixed(2)} /> : <LoadingDots align="start" />}€
                    </CardTitle>
                    <CardAction>
                        {/* {betterCPS ? (
                            <Badge variant="outline">
                                <IconTrendingUp />
                                +<AnimatedNumber value={cpsDifference.toFixed(2)} />€
                            </Badge>
                        ) : (
                            <Badge variant="outline">
                                <IconTrendingDown />
                                <AnimatedNumber value={cpsDifference.toFixed(2)} />€
                            </Badge>
                        )} */}
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    {/* {betterCPS ? (
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            Aufwärtstrend <IconTrendingUp className="size-4" />
                        </div>
                    ) : (
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            Abwärtstrend <IconTrendingDown className="size-4" />
                        </div>
                    )} */}
                    <div className="text-muted-foreground">
                        CPS der gesamten Laufzeit
                    </div>
                </CardFooter>
            </MotionCard>

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
    const formatter = new Intl.NumberFormat("de-DE", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });

    const display = useTransform(spring, (current) =>
        formatter.format(current)
    );
    // const display = useTransform(spring, (current) =>
    //     // Math.round(current).toLocaleString(),
    //     Number(current).toLocaleString(),
    // );

    useEffect(() => {
        if (isInView) {
            spring.set(Number(value));
        } else {
            spring.set(initial);
        }
    }, [isInView, spring, value, initial]);

    return <motion.span ref={ref}>{display}</motion.span>;
}