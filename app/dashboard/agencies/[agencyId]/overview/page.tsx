import React, { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/v1/Card";
import { Users, UserPlus, Zap, CheckCircle2 } from "lucide-react";
import { getDashboardCounts } from "../actions"; // IMPORT CHANGED
// Removed direct imports of charts and leads component
import DashboardChartsSection from "@/components/features/dashboard/overview/DashboardChartsSection";
import RecentLeadsSection from "@/components/features/dashboard/overview/RecentLeadsSection";
import { Skeleton } from "@/components/ui/v1/Skeleton";

// This is a Server Component
export default async function DashboardPage({
    params,
}: {
    params: Promise<{ agencyId: string }>;
}) {
    const { agencyId } = await params;
    // CRITICAL: Only blocking call is for counts
    const stats = await getDashboardCounts(agencyId);

    return (
        <div className="flex flex-col h-full w-full overflow-hidden">
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
                            <div className="text-2xl font-bold text-(--foreground)">{stats.total.toLocaleString()}</div>
                            <p className="text-xs text-(--foreground-muted)">누적 등록된 총 리드 수</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-(--background-surface) border-(--border-surface)">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-(--foreground)">오늘 신규 리드</CardTitle>
                            <UserPlus className="h-4 w-4 text-(--foreground-muted)" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-(--foreground)">{stats.newToday.toLocaleString()}</div>
                            <p className="text-xs text-(--foreground-muted)">
                                {stats.newToday > 0 ? (
                                    <span className="text-green-500 font-medium">+{stats.newToday}명 추가됨</span>
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
                            <div className="text-2xl font-bold text-(--foreground)">{stats.active.toLocaleString()}</div>
                            <p className="text-xs text-(--foreground-muted)">상담 및 계약 진행 중</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-(--background-surface) border-(--border-surface)">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-(--foreground)">성공(계약 완료)</CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-(--foreground-muted)" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-(--foreground)">{stats.success.toLocaleString()}</div>
                            <p className="text-xs text-(--foreground-muted)">계약 성공 건수</p>
                        </CardContent>
                    </Card>
                </div>

                {/* 3. Charts & Recent Activity */}
                {/* 3. Charts & Recent Activity - Wrapped in Suspense */}
                <Suspense fallback={<ChartsSkeleton />}>
                    <DashboardChartsSection agencyId={agencyId} />
                </Suspense>

                {/* 4. Recent Leads - Wrapped in Suspense */}
                <Suspense fallback={<RecentLeadsSkeleton />}>
                    <RecentLeadsSection agencyId={agencyId} />
                </Suspense>
            </div>
        </div>
    );
}

function ChartsSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-2">
            <div className="col-span-1 md:col-span-1 lg:col-span-4 h-[300px] w-full bg-(--background-surface) border border-(--border-surface) rounded-xl animate-pulse" />
            <div className="col-span-1 md:col-span-1 lg:col-span-3 h-[300px] w-full bg-(--background-surface) border border-(--border-surface) rounded-xl animate-pulse" />
        </div>
    )
}

function RecentLeadsSkeleton() {
    return (
        <div className="h-[400px] w-full bg-(--background-surface) border border-(--border-surface) rounded-xl animate-pulse" />
    )
}
