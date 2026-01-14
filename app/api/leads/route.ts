import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/service";

export async function POST(request: NextRequest) {
    const user = await getAuthenticatedUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!user.agencyId) {
        return NextResponse.json({ error: "Agency not found for user" }, { status: 403 });
    }

    const supabase = await createSupabaseServerClient();
    const body = await request.json();

    const { data, error } = await supabase
        .from("leads")
        .insert({
            ...body,
            agency_id: user.agencyId // Enforce Agency ID
        })
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

import { verifyAgencyAccess } from "@/lib/auth/agency";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const agencyId = request.headers.get("x-agency-id") || searchParams.get("agencyId");

    if (!agencyId) {
        return NextResponse.json({ error: "Agency ID is required" }, { status: 400 });
    }

    const auth = await verifyAgencyAccess(agencyId);
    if (!auth) {
         return NextResponse.json({ error: "Unauthorized or Access Denied to this Agency" }, { status: 403 });
    }

    const supabase = await createSupabaseServerClient();

    // Pagination params
    const page = parseInt(searchParams.get("page") || "0", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const from = page * limit;
    const to = from + limit - 1;

    // Fetch leads scoped to Agency
    const { data, error, count } = await supabase
        .from("leads")
        .select("*", { count: "exact" })
        .eq("agency_id", agencyId) // Explicitly use the verified ID
        .order("created_at", { ascending: false })
        .range(from, to);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Determine next page
    const nextId = (data && data.length === limit && (count ? from + limit < count : true))
        ? page + 1
        : null;

    return NextResponse.json({
        data,
        nextId,
        count
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

    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json({ error: "Invalid request. 'ids' array is required." }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();

    const { error } = await supabase
        .from("leads")
        .delete()
        .in("id", ids)
        .eq("agency_id", agencyId); 

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
