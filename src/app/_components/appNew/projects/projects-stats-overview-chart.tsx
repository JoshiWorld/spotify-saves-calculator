"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { api } from "@/trpc/react"
import { LoadingDots } from "@/components/ui/loading"

export const description = "Projects Overview Chart"

const chartConfig = {
  cps: {
    label: "CPS",
    color: "var(--primary)",
  },
} satisfies ChartConfig

export function ProjectStatsOverviewChart() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("90d");
  const { data } = api.project.getStatsProjectViewChart.useQuery();

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile]);

  if(!data) {
    return <LoadingDots />
  }

  const filteredData = data.filter((item) => {
    const date = new Date(item.date);
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  })

  const maxVal = Math.round(Math.max(...data.map((item) => item.cps)) * 1.2) || 1;

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>CPS</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Der letzten 3 Monate
          </span>
          <span className="@[540px]/card:hidden">Letzte 3 Monate</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Letzte 3 Monate</ToggleGroupItem>
            <ToggleGroupItem value="30d">Letzte 30 Tage</ToggleGroupItem>
            <ToggleGroupItem value="7d">Letzte 7 Tage</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Zeitraum auswählen"
            >
              <SelectValue placeholder="Letzte 3 Monate" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Letzte 3 Monate
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Letzte 30 Tage
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Letzte 7 Tage
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillCPS" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-cps)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-cps)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(date: string) => {
                return new Date(date).toLocaleDateString("de-DE", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <YAxis
              domain={[0, maxVal]}
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              tickFormatter={(value: number) => `${value.toFixed(2)}€`}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value: string) => {
                    return new Date(value).toLocaleDateString("de-DE", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="cps"
              type="monotoneX"
              fill="url(#fillCPS)"
              stroke="var(--color-cps)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export function CampaignStatsOverviewChart({ projectId }: { projectId: string }) {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("90d");
  const { data } = api.campaign.getStatsCampaignViewChart.useQuery({ projectId });

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile]);

  if (!data) {
    return <LoadingDots />
  }

  const filteredData = data.filter((item) => {
    const date = new Date(item.date);
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  })

  const maxVal = Math.round(Math.max(...data.map((item) => item.cps)) * 1.2) || 1;

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>CPS</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Der letzten 3 Monate
          </span>
          <span className="@[540px]/card:hidden">Letzte 3 Monate</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Letzte 3 Monate</ToggleGroupItem>
            <ToggleGroupItem value="30d">Letzte 30 Tage</ToggleGroupItem>
            <ToggleGroupItem value="7d">Letzte 7 Tage</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Zeitraum auswählen"
            >
              <SelectValue placeholder="Letzte 3 Monate" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Letzte 3 Monate
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Letzte 30 Tage
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Letzte 7 Tage
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillCPS" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-cps)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-cps)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(date: string) => {
                return new Date(date).toLocaleDateString("de-DE", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <YAxis
              domain={[0, maxVal]}
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              tickFormatter={(value: number) => `${value.toFixed(2)}€`}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value: string) => {
                    return new Date(value).toLocaleDateString("de-DE", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="cps"
              type="monotoneX"
              fill="url(#fillCPS)"
              stroke="var(--color-cps)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export function PostsStatsOverviewChart({ campaignId }: { campaignId: string }) {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("90d");
  const { data } = api.post.getStatsPostsViewChart.useQuery({ campaignId });

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile]);

  if (!data) {
    return <LoadingDots />
  }

  const filteredData = data.filter((item) => {
    const date = new Date(item.date);
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  })

  const maxVal = Math.round(Math.max(...data.map((item) => item.cps)) * 1.2) || 1;

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>CPS</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Der letzten 3 Monate
          </span>
          <span className="@[540px]/card:hidden">Letzte 3 Monate</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Letzte 3 Monate</ToggleGroupItem>
            <ToggleGroupItem value="30d">Letzte 30 Tage</ToggleGroupItem>
            <ToggleGroupItem value="7d">Letzte 7 Tage</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Zeitraum auswählen"
            >
              <SelectValue placeholder="Letzte 3 Monate" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Letzte 3 Monate
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Letzte 30 Tage
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Letzte 7 Tage
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillCPS" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-cps)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-cps)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(date: string) => {
                return new Date(date).toLocaleDateString("de-DE", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <YAxis
              domain={[0, maxVal]}
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              tickFormatter={(value: number) => `${value.toFixed(2)}€`}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value: string) => {
                    return new Date(value).toLocaleDateString("de-DE", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="cps"
              type="monotoneX"
              fill="url(#fillCPS)"
              stroke="var(--color-cps)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export function PostsStatsOverviewChartAlltime({ campaignId }: { campaignId: string }) {
  const { data } = api.post.getStatsPostsViewChartAlltime.useQuery({ campaignId });

  if (!data) {
    return <LoadingDots />
  }

  const maxVal = Math.round(Math.max(...data.map((item) => item.cps)) * 1.2) || 1;

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>CPS</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Des gesamten Zeitraums
          </span>
          <span className="@[540px]/card:hidden">Des gesamten Zeitraums</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={data}>
            <defs>
              <linearGradient id="fillCPS" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-cps)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-cps)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(date: string) => {
                return new Date(date).toLocaleDateString("de-DE", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <YAxis
              domain={[0, maxVal]}
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              tickFormatter={(value: number) => `${value.toFixed(2)}€`}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value: string) => {
                    return new Date(value).toLocaleDateString("de-DE", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="cps"
              type="monotoneX"
              fill="url(#fillCPS)"
              stroke="var(--color-cps)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}