"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { verifyAgencyAccess } from "@/lib/auth/agency"; // Import added

export async function getDashboardStats(agencyId: string) {
    const supabase = await createSupabaseServerClient();

    // 1. Basic Counts
    // Total Leads
    // New Today
    // Active (CONSULTING, MEETING SOON, TRYING, PROVISIONAL CONTRACT)
    // Success

    const today = new Date().toISOString().split("T")[0];

    const { count: totalLeads } = await supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .eq("agency_id", agencyId);

    const { count: newLeadsToday } = await supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .eq("agency_id", agencyId)
        .gte("created_at", `${today}T00:00:00.000Z`);

    const { count: activeLeads } = await supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .eq("agency_id", agencyId)
        .in("stage", [
            "CONSULTING",
            "MEETING SOON",
            "TRYING",
            "PROVISIONAL CONTRACT",
        ]);

    const { count: successLeads } = await supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .eq("agency_id", agencyId)
        .eq("stage", "SUCCESS");

    // 2. Source Distribution
    const { data: sourceData } = await supabase
        .from("leads")
        .select("source")
        .eq("agency_id", agencyId);

    const sourceMap: Record<string, number> = {};
    sourceData?.forEach((item) => {
        const source = item.source || "UNKNOWN";
        sourceMap[source] = (sourceMap[source] || 0) + 1;
    });

    const sourceDistribution = Object.entries(sourceMap).map(([name, value]) => ({
        name,
        value,
    })).sort((a, b) => b.value - a.value); // Sort desc


    // 3. Weekly Trend (Last 7 Days)
    const trendMap: Record<string, number> = {};
    // Initialize last 7 days with 0
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];
        trendMap[dateStr] = 0;
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString();

    const { data: trendData } = await supabase
        .from("leads")
        .select("created_at")
        .eq("agency_id", agencyId)
        .gte("created_at", sevenDaysAgoStr);

    trendData?.forEach((item) => {
        const dateStr = item.created_at.split("T")[0];
        if (trendMap[dateStr] !== undefined) {
             trendMap[dateStr]++;
        }
    });
    
    const weeklyTrend = Object.entries(trendMap).map(([date, count]) => ({
        date: date.substring(5), // "MM-DD"
        count,
    }));


    // 4. Recent Leads
    const { data: recentLeads } = await supabase
        .from("leads")
        .select("id, name, stage, created_at, phone")
        .eq("agency_id", agencyId)
        .order("created_at", { ascending: false })
        .limit(5);

// ... existing code ...
    return {
        counts: {
            total: totalLeads || 0,
            newToday: newLeadsToday || 0,
            active: activeLeads || 0,
            success: successLeads || 0,
        },
        sourceDistribution,
        weeklyTrend,
        recentLeads: recentLeads || [],
    };
}

export async function getAgencyMembers(agencyId: string) {
    const auth = await verifyAgencyAccess(agencyId);
    if (!auth) return [];

    const supabase = await createSupabaseServerClient();

    // 1. Get User IDs from agency_users
    const { data: membershipData, error: membershipError } = await supabase
        .from("agency_users")
        .select("user_id")
        .eq("agency_id", agencyId)
        .eq("status", "ACTIVE");

    if (membershipError || !membershipData) {
        console.error("Error fetching agency members:", membershipError);
        return [];
    }

    const userIds = membershipData.map((m) => m.user_id);

    if (userIds.length === 0) return [];

    // 2. Get Names from users
    const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("id, name")
        .in("id", userIds);

    if (usersError) {
        console.error("Error fetching user details:", usersError);
        return [];
    }

    return usersData.map((u: any) => ({
        id: u.id,
        name: u.name || "Unknown",
    }));
}

