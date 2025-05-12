"use client"

import { useEffect, useState } from "react"
import { TrendingUp } from "lucide-react"
import { PieChart, Pie, LabelList } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

import { getReports } from "../../utils/db/getReports"

const chartConfig = {
  minimum: {
    label: "Minimum",
    color: "hsl(var(--chart-1))",
  },
  medium: {
    label: "Medium",
    color: "hsl(var(--chart-2))",
  },
  maximum: {
    label: "Maximum",
    color: "hsl(var(--chart-3))",
  },
  label: {
    color: "hsl(var(--background))",
  },
}

type GarbageLevelGroup = {
  level: "minimum" | "medium" | "maximum"
  count: number
  fill: string
}

export default function PieGar() {
  const [chartData, setChartData] = useState<GarbageLevelGroup[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getReports()

        let min = 0,
          med = 0,
          max = 0

        data.forEach((item: any) => {
          const level = Number(item.garbagelevel)
          if (level <= 30) min++
          else if (level <= 70) med++
          else max++
        })

        const formatted: GarbageLevelGroup[] = [
          {
            level: "minimum",
            count: min,
            fill: "hsl(210, 100%, 65%)", // Blue
          },
          {
            level: "medium",
            count: med,
            fill: "hsl(48, 100%, 67%)", // Yellow
          },
          {
            level: "maximum",
            count: max,
            fill: "hsl(0, 84%, 60%)", // Red
          },
        ]

        setChartData(formatted)
      } catch (err) {
        console.error("Failed to classify garbage levels:", err)
      }
    }

    fetchData()
  }, [])

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Garbage Fill Level</CardTitle>
        <CardDescription>Grouped by urgency</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px] [&_.recharts-text]:fill-background"
        >
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent nameKey="level" valueKey="count" />
              }
            />
            <Pie data={chartData} dataKey="count" nameKey="level">
              <LabelList
                dataKey="level"
                className="fill-background"
                stroke="none"
                fontSize={12}
                formatter={(value: keyof typeof chartConfig) =>
                  chartConfig[value]?.label
                }
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Garbage level summary <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Based on current garbagelevel values
        </div>
      </CardFooter>
    </Card>
  )
}

