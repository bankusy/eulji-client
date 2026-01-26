import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, Zap, CheckCircle2 } from "lucide-react";
import { getDashboardStats } from "../actions";
import WeeklyTrendChart from "@/components/features/dashboard/WeeklyTrendChart";
import SourceDistributionChart from "@/components/features/dashboard/SourceDistributionChart";
import { columnsConfiguration } from "@/types/lead";

// This is a Server Component
export default async function DashboardPage({
    params,
}: {
    params: Promise<{ agencyId: string }>;
}) {
    const { agencyId } = await params;
    const stats = await getDashboardStats(agencyId);

    // Helpers for mapping
    const stageConfig = columnsConfiguration.find((c) => c.key === "stage");
    const sourceConfig = columnsConfiguration.find((c) => c.key === "source");

    const getStageLabel = (value: string) =>
        stageConfig?.options?.find((o) => o.value === value)?.label || value;

    const getSourceLabel = (value: string) =>
        sourceConfig?.options?.find((o) => o.value === value)?.label || value;

    // Map source distribution data to Korean labels
    const mappedSourceDistribution = stats.sourceDistribution.map((item: { name: string; value: number }) => ({
        ...item,
        name: getSourceLabel(item.name),
    }));

    return (
        <div className="flex flex-col h-full w-full overflow-hidden gap-2">
            {/* 1. Header */}
            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto space-y-2 scrollbar-hide-vertical">
                {/* 2. Key Metrics Cards */}
                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="bg-(--background-surface) border-(--border-surface)">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-(--foreground)">전체 리드</CardTitle>
                            <Users className="h-4 w-4 text-(--foreground-muted)" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-(--foreground)">{stats.counts.total.toLocaleString()}</div>
                            <p className="text-xs text-(--foreground-muted)">누적 등록된 총 리드 수</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-(--background-surface) border-(--border-surface)">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-(--foreground)">오늘 신규 리드</CardTitle>
                            <UserPlus className="h-4 w-4 text-(--foreground-muted)" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-(--foreground)">{stats.counts.newToday.toLocaleString()}</div>
                            <p className="text-xs text-(--foreground-muted)">
                                {stats.counts.newToday > 0 ? (
                                    <span className="text-green-500 font-medium">+{stats.counts.newToday}명 추가됨</span>
                                ) : (
                                    "오늘 추가된 리드가 없습니다"
                                )}
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="bg-(--background-surface) border-(--border-surface)">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-(--foreground)">진행 중인 리드</CardTitle>
                            <Zap className="h-4 w-4 text-(--foreground-muted)" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-(--foreground)">{stats.counts.active.toLocaleString()}</div>
                            <p className="text-xs text-(--foreground-muted)">상담 및 계약 진행 중</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-(--background-surface) border-(--border-surface)">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-(--foreground)">성공(계약 완료)</CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-(--foreground-muted)" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-(--foreground)">{stats.counts.success.toLocaleString()}</div>
                            <p className="text-xs text-(--foreground-muted)">계약 성공 건수</p>
                        </CardContent>
                    </Card>
                </div>

                {/* 3. Charts & Recent Activity */}
                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-7">
                    {/* Weekly Trend Chart (4 cols) */}
                    <WeeklyTrendChart data={stats.weeklyTrend} />

                    {/* Source Distribution Pie Chart (3 cols) */}
                    <SourceDistributionChart
                        data={mappedSourceDistribution}
                        totalCount={stats.counts.total}
                    />
                </div>

                {/* 4. Recent Leads */}
                <Card className="bg-(--background-surface) border-(--border-surface)">
                    <CardHeader>
                        <CardTitle className="text-(--foreground)">최근 등록된 리드</CardTitle>
                        <CardDescription className="text-(--foreground-muted)">가장 최근에 등록된 5명의 리드입니다.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {stats.recentLeads.map((lead) => (
                                <div key={lead.id} className="flex items-center">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={`https://avatar.vercel.sh/${lead.name}.png`} alt={lead.name} />
                                        <AvatarFallback className="bg-(--background-subtle) text-(--foreground)">{lead.name.slice(0, 2)}</AvatarFallback>
                                    </Avatar>
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none text-(--foreground)">{lead.name}</p>
                                        <p className="text-sm text-(--foreground-muted)">{lead.phone || "연락처 없음"}</p>
                                    </div>
                                    <div className="ml-auto font-medium">
                                        <Badge variant={
                                            // lead.stage === 'SUCCESS' ? "default" :
                                                // lead.stage === 'NEW' ? "secondary" : "outline"
                                                "default"
                                        }>
                                            {getStageLabel(lead.stage)}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                            {stats.recentLeads.length === 0 && (
                                <div className="text-center text-(--foreground-muted) py-4">
                                    등록된 리드가 없습니다.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
