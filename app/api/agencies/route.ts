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
        const { name, license_no } = body;

        if (!name) {
            return NextResponse.json({ error: "Agency name is required" }, { status: 400 });
        }

        // 2. Fetch Public User first
        const { data: publicUser, error: userFetchError } = await supabase
            .from("users")
            .select("id")
            .eq("email", user.email)
            .single();

        if (userFetchError || !publicUser) {
            return NextResponse.json({ error: "Public user profile not found" }, { status: 404 });
        }

        // 2a. Check if user is already an OWNER of any agency
        const { data: existingOwnership, error: ownershipError } = await supabase
            .from("agency_users")
            .select("id")
            .eq("user_id", publicUser.id)
            .eq("role", "OWNER")
            .eq("status", "ACTIVE")
            .maybeSingle();

        if (existingOwnership) {
            return NextResponse.json({ error: "이미 소유한 에이전시가 있습니다. (계정당 1개 제한)" }, { status: 400 });
        }

        // 3. Create Agency
        const { data: agency, error: createError } = await supabase
            .from("agencies")
            .insert({
                name,
                invite_code: Math.random().toString(36).substring(2, 8).toUpperCase()
            })
            .select("id")
            .single();

        if (createError) {
            console.error("Error creating agency:", createError);
            return NextResponse.json({ error: "Failed to create agency" }, { status: 500 });
        }

        // 4. Create Agency User (OWNER)
        const { error: linkError } = await supabase
            .from("agency_users")
            .insert({
                agency_id: agency.id,
                user_id: publicUser.id,
                role: "OWNER",
                status: "ACTIVE"
            });

        if (linkError) {
            console.error("Error linking user to agency:", linkError);
            return NextResponse.json({ error: "Failed to link user to agency" }, { status: 500 });
        }

        return NextResponse.json({ success: true, agencyId: agency.id });

    } catch (error) {
        console.error("Unexpected error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
