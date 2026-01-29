import { Suspense } from "react";
import dynamic from "next/dynamic";
import { getDashboardChartsData } from "@/app/dashboard/agencies/[agencyId]/actions";
import { leadColumns } from "@/types/lead";
import type { WeeklyTrendChartProps } from "@/components/features/dashboard/WeeklyTrendChart";
import type { SourceDistributionChartProps } from "@/components/features/dashboard/SourceDistributionChart";

// const WeeklyTrendChart = dynamic(() => import("@/components/features/dashboard/WeeklyTrendChart"), {
//     ssr: false,
//     loading: () => <div className="h-[200px] w-full bg-(--background-subtle) animate-pulse rounded-xl" />,
// });

// const SourceDistributionChart = dynamic(() => import("@/components/features/dashboard/SourceDistributionChart"), {
//     ssr: false,
//     loading: () => <div className="h-[200px] w-full bg-(--background-subtle) animate-pulse rounded-xl" />,
// });

export default async function DashboardChartsSection({ agencyId }: { agencyId: string }) {
    const stats = await getDashboardChartsData(agencyId);

    // Helpers (duplicated logic, could be shared util)
    const sourceConfig = leadColumns.find((c) => c.key === "source");
    const getSourceLabel = (value: string) =>
        sourceConfig?.options?.find((o) => o.value === value)?.label || value;

    const mappedSourceDistribution = stats.sourceDistribution.map((item: { name: string; value: number }) => ({
        ...item,
        name: getSourceLabel(item.name),
    }));

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-2">
            {/* <WeeklyTrendChart data={stats.weeklyTrend} />
            <SourceDistributionChart
                data={mappedSourceDistribution}
                totalCount={stats.totalCount}
            /> */}
        </div>
    );
}

