
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const supabase = await createSupabaseServerClient();

    // 1. Auth Check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // 2. Get Current User's Agency ID
        const { data: currentUser, error: userFetchError } = await supabase
            .from("users")
            .select("agency_id")
            .eq("email", user.email)
            .single();

        if (userFetchError || !currentUser?.agency_id) {
            return NextResponse.json({ error: "User agency not found" }, { status: 404 });
        }

        // 3. Fetch All Users in Agency
        const { data: agencyUsers, error: usersError } = await supabase
            .from("users")
            .select("id, name, email, role")
            .eq("agency_id", currentUser.agency_id);

        if (usersError) {
            console.error("Error fetching agency users:", usersError);
            return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
        }

        return NextResponse.json({ users: agencyUsers });

    } catch (error) {
        console.error("Unexpected error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
