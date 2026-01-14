import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const supabase = await createSupabaseServerClient();
    const body = await request.json();

    // 1. Check for Agency ID or fetch default
    let agency_id = body.agency_id;
    if (!agency_id) {
        const { data: agency } = await supabase
            .from("agencies")
            .select("id")
            .limit(1)
            .single();

        if (agency) {
            agency_id = agency.id;
        } else {
            // Fallback if no agency exists (should setup seed data)
            return NextResponse.json({ error: "No agency found to assign lead to." }, { status: 500 });
        }
    }

    // Prepare Lead Data
    const leadData = {
        agency_id: agency_id,
        name: body.name,
        phone: body.phone,
        source: "프로필문의",
        stage: "NEW", // Default stage
        message: body.message, // [NEW] Save to dedicated column
        preferences: {} // Empty preferences for now
    };

    const { data, error } = await supabase
        .from("leads")
        .insert(leadData)
        .select()
        .single();

    if (error) {
        console.error("Error creating lead:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}
