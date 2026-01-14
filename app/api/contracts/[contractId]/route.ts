import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/service";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ contractId: string }> }
) {
    const user = await getAuthenticatedUser();
    const { contractId } = await params;

    if (!contractId || contractId === "undefined") {
        return NextResponse.json({ error: "Invalid contract ID" }, { status: 400 });
    }

    if (!user || !user.agencyId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createSupabaseServerClient();
    const body = await request.json();

    const { data, error } = await supabase
        .from("contracts")
        .update(body)
        .eq("id", contractId)
        .eq("agency_id", user.agencyId)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}
