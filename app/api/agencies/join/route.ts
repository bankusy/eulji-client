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
        const { invite_code } = body;

        if (!invite_code) {
            return NextResponse.json({ error: "Invite Code required" }, { status: 400 });
        }

        // 2. Verify Agency Exists by Invite Code
        const { data: agency, error: agencyError } = await supabase
            .from("agencies")
            .select("id, name")
            .eq("invite_code", invite_code)
            .single();

        if (agencyError || !agency) {
            return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });
        }
        
        const targetAgencyId = agency.id;

        // 3. Get Public User ID
        const { data: publicUser, error: userFetchError } = await supabase
            .from("users")
            .select("id")
            .eq("email", user.email)
            .single();

        if (userFetchError || !publicUser) {
            return NextResponse.json({ error: "Public user profile not found" }, { status: 404 });
        }

        // 4. Check if already a member
        const { data: existingMembership } = await supabase
            .from("agency_users")
            .select("id")
            .eq("agency_id", targetAgencyId)
            .eq("user_id", publicUser.id)
            .single();

        if (existingMembership) {
            return NextResponse.json({ error: "Already a member of this agency" }, { status: 400 });
        }

        // 5. Add to agency_users with ACTIVE status (자동 승인)
        const { error: insertError } = await supabase
            .from("agency_users")
            .insert({
                agency_id: targetAgencyId,
                user_id: publicUser.id,
                role: "MEMBER",
                status: "ACTIVE", // 자동 승인
                joined_at: new Date().toISOString(),
            });

        if (insertError) {
            console.error("Insert error:", insertError);
            return NextResponse.json({ error: "Failed to join agency" }, { status: 500 });
        }

        return NextResponse.json({ 
            success: true, 
            agencyId: targetAgencyId,
            agencyName: agency.name 
        });

    } catch (error) {
        console.error("Unexpected error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
