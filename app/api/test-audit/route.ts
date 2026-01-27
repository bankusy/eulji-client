import { NextResponse } from "next/server";
import { logActivity } from "@/lib/audit";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; // Force using Anon Key for test
    const supabase = createClient(supabaseUrl, supabaseKey);

    const testId = "test-log-" + Date.now();
    
    // 1. Try generic insert without user_id
    const { data, error } = await supabase.from("audit_logs").insert({
        action: "TEST_LOG",
        details: { testId },
        ip_address: "127.0.0.1",
        user_id: null 
    }).select();

    return NextResponse.json({ 
        testId,
        success: !error,
        error: error,
        data: data,
        config: {
            url: supabaseUrl.substring(0, 20) + "...",
            hasKey: !!supabaseKey
        }
    });
}
