import React from "react";
import { getDashboardStats } from "./actions";

// This is a Server Component
export default async function DashboardPage({
    params,
}: {
    params: Promise<{ agencyId: string }>;
}) {
    const { agencyId } = await params;

    return (
        <div className="flex-1 space-y-6 p-2 overflow-y-auto">
            {/* 1. Key Metrics Cards */}
        </div>
    );
}
