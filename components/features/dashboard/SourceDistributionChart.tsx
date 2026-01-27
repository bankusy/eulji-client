"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Pie, PieChart, Label } from "recharts";

interface SourceDistributionChartProps {
    data: { name: string; value: number }[];
    totalCount: number;
}

export default function SourceDistributionChart({ data, totalCount }: SourceDistributionChartProps) {
    const sourceChartConfig = {
        count: {
            label: "유입 수",
        },
        ...Object.fromEntries(
            data.map((item, index) => [
                item.name,
                { label: item.name, color: `hsl(var(--chart-${(index % 5) + 1}))` },
            ])
        ),
    };

    const pieData = data.map((item, index) => ({
        ...item,
        fill: `hsl(var(--chart-${(index % 5) + 1}))`,
    }));

    return (
        <Card className="col-span-1 md:col-span-1 lg:col-span-3 bg-(--background-surface) border-(--border-surface)">
            <CardHeader>
                <CardTitle className="text-(--foreground)">유입 경로 분석</CardTitle>
                <CardDescription className="text-(--foreground-muted)">리드 유입 경로 분포입니다.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={sourceChartConfig}
                    className="mx-auto aspect-square max-h-[300px]"
                >
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel className="bg-(--background) border-(--border) text-(--foreground)" />}
                        />
                        <Pie
                            data={pieData}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={60}
                            strokeWidth={5}
                            className="stroke-(--background-surface)"
                        >
                            <Label
                                content={({ viewBox }) => {
                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                        return (
                                            <text
                                                x={viewBox.cx}
                                                y={viewBox.cy}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                            >
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    className="fill-(--foreground) text-3xl font-bold"
                                                >
                                                    {totalCount.toLocaleString()}
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 24}
                                                    className="fill-(--foreground-muted)"
                                                >
                                                    Total
                                                </tspan>
                                            </text>
                                        )
                                    }
                                }}
                            />
                        </Pie>
                        <ChartLegend content={<ChartLegendContent nameKey="name" />} className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center" />
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
