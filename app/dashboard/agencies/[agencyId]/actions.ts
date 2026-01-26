"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { verifyAgencyAccess } from "@/lib/auth/agency"; // Import added

// 사용하는 쿼리들 정리해놓은 곳
export async function getDashboardStats(agencyId: string) {
    const supabase = await createSupabaseServerClient();

    const today = new Date().toISOString().split("T")[0];
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString();

    // 1. Prepare Promises for Parallel Execution
    const totalLeadsPromise = supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .eq("agency_id", agencyId);

    const newLeadsTodayPromise = supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .eq("agency_id", agencyId)
        .gte("created_at", `${today}T00:00:00.000Z`);

    const activeLeadsPromise = supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .eq("agency_id", agencyId)
        .in("stage", [
            "CONSULTING",
            "MEETING SOON",
            "TRYING",
            "PROVISIONAL CONTRACT",
        ]);

    const successLeadsPromise = supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .eq("agency_id", agencyId)
        .eq("stage", "SUCCESS");

    const sourceDataPromise = supabase
        .from("leads")
        .select("source")
        .eq("agency_id", agencyId);

    const trendDataPromise = supabase
        .from("leads")
        .select("created_at")
        .eq("agency_id", agencyId)
        .gte("created_at", sevenDaysAgoStr);

    const recentLeadsPromise = supabase
        .from("leads")
        .select("id, name, stage, created_at, phone")
        .eq("agency_id", agencyId)
        .order("created_at", { ascending: false })
        .limit(5);

    const [
        totalRes,
        newTodayRes,
        activeRes,
        successRes,
        sourceRes,
        trendRes,
        recentRes,
    ] = await Promise.all([
        totalLeadsPromise,
        newLeadsTodayPromise,
        activeLeadsPromise,
        successLeadsPromise,
        sourceDataPromise,
        trendDataPromise,
        recentLeadsPromise,
    ]);

    // 3. Process Results
    const totalLeads = totalRes.count;
    const newLeadsToday = newTodayRes.count;
    const activeLeads = activeRes.count;
    const successLeads = successRes.count;

    // Source Distribution
    const sourceMap: Record<string, number> = {};
    sourceRes.data?.forEach((item) => {
        const source = item.source || "UNKNOWN";
        sourceMap[source] = (sourceMap[source] || 0) + 1;
    });

    const sourceDistribution = Object.entries(sourceMap)
        .map(([name, value]) => ({
            name,
            value,
        }))
        .sort((a, b) => b.value - a.value);

    // Weekly Trend
    const trendMap: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];
        trendMap[dateStr] = 0;
    }

    trendRes.data?.forEach((item) => {
        const dateStr = item.created_at.split("T")[0];
        if (trendMap[dateStr] !== undefined) {
            trendMap[dateStr]++;
        }
    });

    const weeklyTrend = Object.entries(trendMap).map(([date, count]) => ({
        date: date.substring(5), // "MM-DD"
        count,
    }));

    return {
        counts: {
            total: totalLeads || 0,
            newToday: newLeadsToday || 0,
            active: activeLeads || 0,
            success: successLeads || 0,
        },
        sourceDistribution,
        weeklyTrend,
        recentLeads: recentRes.data || [],
    };
}

export async function getAgencyMembers(agencyId: string) {
    const auth = await verifyAgencyAccess(agencyId);
    if (!auth) return [];

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
        .from("agency_users")
        .select(
            `
            user_id,
            users ( id, name, nickname )
        `,
        )
        .eq("agency_id", agencyId)
        .eq("status", "ACTIVE");

    if (error) {
        console.error("Error fetching agency members:", error);
        return [];
    }

    if (!data) return [];

    return data
        .map((item: any) => {
            const u = Array.isArray(item.users) ? item.users[0] : item.users;
            return {
                id: u?.id || item.user_id,
                name: u?.nickname || u?.name || "알 수 없음",
            };
        })
        .filter((u) => u.id);
}
