import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";


import { verifyAgencyAccess } from "@/lib/auth/agency";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const agencyId = request.headers.get("x-agency-id") || searchParams.get("agencyId");

    if (!agencyId) {
        return NextResponse.json({ error: "Agency ID is required" }, { status: 400 });
    }

    const auth = await verifyAgencyAccess(agencyId);
    if (!auth) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const cursor = parseInt(searchParams.get("cursor") || "0");
    const limit = parseInt(searchParams.get("limit") || "20");
    const sortKey = searchParams.get("sortKey") || "created_at";
    const sortDirection = searchParams.get("sortDirection") || "desc";

    const supabase = await createSupabaseServerClient();

    let query = supabase
        .from("contracts")
        .select("*, lead:leads(name, phone)")
        .eq("agency_id", agencyId)
        .range(cursor, cursor + limit - 1);

    if (sortKey) {
        query = query.order(sortKey, { ascending: sortDirection === "asc" });
    }

    const { data, error } = await query;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const nextCursor = data.length === limit ? cursor + limit : null;

    return NextResponse.json({
        data,
        nextCursor,
    });
}

export async function DELETE(request: NextRequest) {
    const agencyId = request.headers.get("x-agency-id");
    if (!agencyId) {
        return NextResponse.json({ error: "Agency ID required" }, { status: 400 });
    }

    const auth = await verifyAgencyAccess(agencyId);
    if (!auth) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids)) {
        return NextResponse.json({ error: "Invalid IDs" }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();

    const { error } = await supabase
        .from("contracts")
        .delete()
        .in("id", ids)
        .eq("agency_id", agencyId);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
