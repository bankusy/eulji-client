import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ agencyId: string }> }
) {
    try {
        const { agencyId } = await params;

        const supabase = await createSupabaseServerClient();

        const { data: agency, error } = await supabase
            .from("agencies")
            .select("id, name, kakao_url")
            .eq("id", agencyId)
            .single();

        if (error || !agency) {
            return NextResponse.json(
                { error: "Agency not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            name: agency.name,
            kakao_url: agency.kakao_url,
        });
    } catch (error) {
        console.error("Unexpected error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
