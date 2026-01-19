// "use client";

// import React from "react";
// import {
//     PieChart,
//     Pie,
//     BarChart,
//     Bar,
//     XAxis,
//     YAxis,
//     CartesianGrid,
//     Cell,
//     LabelList,
// } from "recharts";


// interface ChartsProps {
//     sourceDistribution: { name: string; value: number }[];
//     weeklyTrend: { date: string; count: number }[];
// }

// export default function DashboardCharts({
//     sourceDistribution,
//     weeklyTrend,
// }: ChartsProps) {
//      const sourceMap: Record<string, string> = {
//         ZIGBANG: "직방",
//         DABANG: "다방",
//         NAVER: "네이버",
//         BLOG: "블로그",
//         YOUTUBE: "유튜브",
//         REFERRAL: "지인 추천",
//         KAKAO: "카카오",
//         DIRECT: "직접입력",
//         UNKNOWN: "기타",
//     };

//     const formattedSourceData = sourceDistribution.map((d, index) => ({
//         ...d,
//         name: sourceMap[d.name] || d.name,
//         fill: `var(--color-source-${index % 5})` // Dynamic color mapping
//     }));

//      const trendChartConfig = {
//         count: {
//             label: "유입 수",
//             color: "hsl(var(--primary))",
//         },
//     } satisfies ChartConfig;

//     const sourceChartConfig = {
//         value: {
//             label: "건수",
//         },
//         // We can manually define colors for top 5 sources or just cycle them
//         "source-0": { label: "Source 1", color: "hsl(var(--chart-1))" },
//         "source-1": { label: "Source 2", color: "hsl(var(--chart-2))" },
//         "source-2": { label: "Source 3", color: "hsl(var(--chart-3))" },
//         "source-3": { label: "Source 4", color: "hsl(var(--chart-4))" },
//         "source-4": { label: "Source 5", color: "hsl(var(--chart-5))" },
//     } satisfies ChartConfig;

//     return (
//         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
//             {/* Weekly Trend (Bar Chart) */}
//             <div className="col-span-4 rounded-xl border border-(--border) bg-(--background-subtle) p-6 shadow-sm">
//                 <div className="mb-4">
//                     <h3 className="font-semibold text-(--foreground)">주간 리드 유입 추이</h3>
//                     <p className="text-sm text-(--foreground-muted)">최근 7일간의 리드 등록 현황</p>
//                 </div>
//                 <div></div>
//                 <ChartContainer config={trendChartConfig} className="min-h-[250px] w-full">
//                     <BarChart accessibilityLayer data={weeklyTrend}>
//                         <CartesianGrid vertical={false} />
//                         <XAxis
//                             dataKey="date"
//                             tickLine={false}
//                             tickMargin={10}
//                             axisLine={false}
//                         />
//                          <YAxis
//                             tickLine={false}
//                             axisLine={false}
//                             allowDecimals={false}
//                             width={30}
//                         />
//                         <ChartTooltip content={<ChartTooltipContent hideLabel />} />
//                         <Bar dataKey="count" fill="var(--color-count)" radius={4} />
//                     </BarChart>
//                 </ChartContainer>
//             </div>

//             {/* Source Distribution (Pie Chart) */}
//             <div className="col-span-3 rounded-xl border border-(--border) bg-(--background-subtle) p-6 shadow-sm">
//                 <div className="mb-4">
//                     <h3 className="font-semibold text-(--foreground)">유입 경로 분포</h3>
//                     <p className="text-sm text-(--foreground-muted)">전체 리드의 유입 출처</p>
//                 </div>
//                 {formattedSourceData.length > 0 ? (
//                     <ChartContainer config={sourceChartConfig} className="mx-auto aspect-square max-h-[300px]">
//                         <PieChart>
//                             <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
//                             <Pie
//                                 data={formattedSourceData}
//                                 dataKey="value"
//                                 nameKey="name"
//                                 innerRadius={60}
//                                 strokeWidth={5}
//                             >
//                                 <LabelList
//                                      dataKey="name"
//                                      className="fill-background"
//                                      stroke="none"
//                                      fontSize={12}
//                                      formatter={(value: any) => value}
//                                  />
//                             </Pie>
//                              <ChartLegend content={<ChartLegendContent nameKey="name" />} className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center" />
//                         </PieChart>
//                     </ChartContainer>
//                 ) : (
//                     <div className="flex w-full h-full items-center justify-center text-(--foreground-muted) text-sm min-h-[200px]">
//                          데이터가 없습니다.
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// }
