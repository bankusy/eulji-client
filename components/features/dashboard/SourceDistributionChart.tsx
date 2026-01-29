"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/v1/Card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/Chart";
import { Pie, PieChart, Label } from "recharts";

interface SourceDistributionChartProps {
    data: { name: string; value: number }[];
    totalCount: number;
}

export default function SourceDistributionChart({ data, totalCount }: SourceDistributionChartProps) {
    // 1. Sort data by value desc
    const sortedData = [...data].sort((a, b) => b.value - a.value);

    // 2. Group into Top 4 + Others
    const MAX_ITEMS = 4;
    let finalData = sortedData;

    if (sortedData.length > MAX_ITEMS) {
        const topItems = sortedData.slice(0, MAX_ITEMS);
        const otherItems = sortedData.slice(MAX_ITEMS);
        const otherSum = otherItems.reduce((sum, item) => sum + item.value, 0);

        finalData = [
            ...topItems,
            { name: "기타", value: otherSum }
        ];
    }

    const SOURCE_LABEL_MAP: Record<string, string> = {
        NAVER: "네이버부동산",
        ZIGBANG: "직방",
        DABANG: "다방",
        PETERPAN: "피터팬",
        BLOG: "블로그",
        INSTAGRAM: "인스타그램",
        WEB_FORM: "문의 폼",
        YOUTUBE: "유튜브",
        KAKAO: "카카오",
        CAFE: "카페",
        WALKIN: "워크인",
        REFERRAL: "지인소개",
        ETC: "기타",
    };

    const COLORS = [
        "var(--primary)",
        "var(--ring)",
        "var(--foreground)",
        "var(--foreground-muted)",
        "var(--outline)",
        "var(--muted)", // Color for 'Other' or extra
    ];

    const sourceChartConfig = {
        count: {
            label: "유입 수",
        },
        ...Object.fromEntries(
            finalData.map((item, index) => {
                const label = SOURCE_LABEL_MAP[item.name] || item.name;
                return [
                    item.name,
                    { label: label, color: item.name === "기타" ? "var(--muted-foreground)" : COLORS[index % COLORS.length] },
                ];
            })
        ),
    };

    const pieData = finalData.map((item, index) => ({
        ...item,
        name: SOURCE_LABEL_MAP[item.name] || item.name, // Map name to label for Pie segment
        fill: item.name === "기타" ? "var(--muted-foreground)" : COLORS[index % COLORS.length],
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
