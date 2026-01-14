import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { agencyId } = await req.json();

        // 1. Get Public User ID via identities
        let publicUserId: string | null = null;
        const identities = user.identities || [];

        for (const identity of identities) {
            if (!identity.id) continue;
            // Assuming we trust the first match in identities
            const { data } = await supabase
                .from("user_identities")
                .select("user_id")
                .eq("provider_user_id", identity.id)
                .maybeSingle();
            
            if (data) {
                publicUserId = data.user_id;
                break;
            }
        }
        
        if (!publicUserId) {
             return NextResponse.json({ error: "User not synced" }, { status: 404 });
        }

        // 2. Security Check: Ensure user belongs to this agency in 'agency_users'
        const { data: membership } = await supabase
            .from("agency_users")
            .select("id, role")
            .eq("user_id", publicUserId)
            .eq("agency_id", agencyId)
            .eq("status", "ACTIVE")
            .single();

        if (!membership) {
            return NextResponse.json({ error: "Access Denied" }, { status: 403 });
        }

        // 3. Set Cookie to persist selection
        const cookieStore = await cookies();
        cookieStore.set("selected_agency_id", agencyId, {
            path: "/",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 30, // 30 days
        });

        // No longer updating users.agency_id column

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Switch Agency Error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
