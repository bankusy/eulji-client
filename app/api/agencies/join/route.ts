import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const supabase = await createSupabaseServerClient();

    // 1. Auth Check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { invite_code, agency_id } = body;

        if (!invite_code) {
            return NextResponse.json({ error: "Invite Code required" }, { status: 400 });
        }

        // 2. Verify Agency Exists by Invite Code
        const { data: agency, error: agencyError } = await supabase
            .from("agencies")
            .select("id")
            .eq("invite_code", invite_code)
            .single();

        if (agencyError || !agency) {
            return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });
        }
        
        const targetAgencyId = agency.id;

        // 3. Update User
        const { data: publicUser, error: userFetchError } = await supabase
            .from("users")
            .select("id")
            .eq("email", user.email)
            .single();

        if (userFetchError || !publicUser) {
            return NextResponse.json({ error: "Public user profile not found" }, { status: 404 });
        }

        const { error: updateError } = await supabase
            .from("users")
            .update({
                agency_id: targetAgencyId,
                role: "MEMBER" // Default role for joiners
            })
            .eq("id", publicUser.id);

        if (updateError) {
            return NextResponse.json({ error: "Failed to join agency" }, { status: 500 });
        }

        return NextResponse.json({ success: true, agencyId: targetAgencyId });

    } catch (error) {
        console.error("Unexpected error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
