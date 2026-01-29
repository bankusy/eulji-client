"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/v1/Card";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/Chart";

interface WeeklyTrendChartProps {
    data: { date: string; count: number }[];
}

export default function WeeklyTrendChart({ data }: WeeklyTrendChartProps) {
    const trendChartConfig = {
        leads: {
            label: "신규 리드",
            color: "hsl(var(--chart-1))",
        },
    };

    return (
        <Card className="col-span-1 md:col-span-1 lg:col-span-4 bg-(--background-surface) border-(--border-surface)">
            <CardHeader>
                <CardTitle className="text-(--foreground)">주간 리드 유입 현황</CardTitle>
                <CardDescription className="text-(--foreground-muted)">최근 7일간 등록된 신규 리드 수입니다.</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                <ChartContainer config={trendChartConfig} className="min-h-[50px] w-full">
                    <BarChart accessibilityLayer data={data}>
                        <CartesianGrid vertical={false} className="stroke-(--border-subtle)" />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            className="text-(--foreground-muted)"
                        />
                        <ChartTooltip content={<ChartTooltipContent hideLabel className="bg-(--background) border-(--border) text-(--foreground)" />} />
                        <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
