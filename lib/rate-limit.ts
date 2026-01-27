import { createClient } from "@supabase/supabase-js";

// Create a single supabase client for rate limiting (using service role key if available, or anon key)
// Ideally middleware should use a lightweight client.
// Since we are in Next.js middleware context often, let's keep it simple.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function rateLimit(key: string, limit: number = 10, windowMs: number = 60000): Promise<{ success: boolean }> {
    try {
        const { data, error } = await supabase.rpc('check_rate_limit', {
            request_key: key,
            limit_count: limit,
            window_ms: windowMs
        });
        
        if (error) {
            console.error("Rate limit RPC error:", error);
            // Fail open (allow request) if rate limit fails, to avoid blocking legit users on system error
            return { success: true };
        }
        
        return { success: data as boolean };
    } catch (e) {
        console.error("Rate limit exception:", e);
        return { success: true };
    }
}
