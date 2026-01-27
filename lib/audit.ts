import { createClient } from "@supabase/supabase-js";

// Use service role key for audit logging to ensure write access regardless of user permissions
// and to prevent users from fabricating logs client-side (if we were using client SDK directly, which we aren't here).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 

// Fallback to anon key if service key is missing (dev env), but warn.
// In prod, service key is essential for secure logging if RLS blocks 'insert'.
const effectiveKey = supabaseServiceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, effectiveKey);

export async function logActivity(
    userId: string | undefined | null,
    action: string,
    details: any = {},
    ipAddress: string = "unknown"
) {
    try {
        const { error } = await supabase.from("audit_logs").insert({
            user_id: userId || null,
            action,
            details,
            ip_address: ipAddress
        });

        if (error) {
            console.error("Audit log failed:", error);
        }
    } catch (e) {
        console.error("Audit log exception:", e);
    }
}
