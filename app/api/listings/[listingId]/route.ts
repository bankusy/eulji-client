import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/service";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ listingId: string }> }
) {
    const user = await getAuthenticatedUser();
    const { listingId } = await params;

    if (!listingId || listingId === "undefined") {
        return NextResponse.json({ error: "Invalid listing ID" }, { status: 400 });
    }

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!user.agencyId) {
        return NextResponse.json({ error: "Agency not found for user" }, { status: 403 });
    }

    const supabase = await createSupabaseServerClient();
    const body = await request.json();

    const { data, error } = await supabase
        .from("listings")
        .update(body)
        .eq("id", listingId)
        .eq("agency_id", user.agencyId)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}
