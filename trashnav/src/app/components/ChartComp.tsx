"use client";

import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  LabelList,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import { getReports } from "../../utils/db/getReports";

type ChartData = {
  address: string;
  count: number;
};

const AREAS = ["Papine", "Liguanea", "Kintyre"];

const chartConfig = {
  count: {
    label: "Reports",
    color: "hsl(var(--chart-1))",
  },
  label: {
    color: "hsl(var(--background))",
  },
};

export default function ChartComp() {
  const [chartData, setChartData] = useState<ChartData[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getReports();
        console.log(data);
        // Initialize count with zero for each target area
        const areaCounts: Record<string, number> = {
          Papine: 0,
          Liguanea: 0,
          Kintyre: 0,
        };

        data!.forEach((item: any) => {
          const address = item.address;
          if (AREAS.includes(address)) {
            areaCounts[address] += 1;
          }
        });

        // Format for chart
        const formatted = AREAS.map((address) => ({
          address,
          count: areaCounts[address],
        }));

        setChartData(formatted);
      } catch (err) {
        console.error("Failed to fetch reports:", err);
      }
    }

    fetchData();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Garbage Reports by Area</CardTitle>
        <CardDescription>Only Papine, Liguanea & Kintyre</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ right: 16 }}
            width={500}
            height={40 * chartData.length}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="area"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              width={100}
            />
            <XAxis type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Bar dataKey="count" fill="var(--color-count)" radius={4}>
              <LabelList
                dataKey="area"
                position="insideLeft"
                offset={8}
                className="fill-[--color-label]"
                fontSize={12}
              />
              <LabelList
                dataKey="count"
                position="right"
                offset={8}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Real-time area insights <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Filtered to 3 Kingston areas
        </div>
      </CardFooter>
    </Card>
  );
}
