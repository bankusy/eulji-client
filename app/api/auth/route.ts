import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
    const client = await createSupabaseServerClient();
    const {data, error} = await client.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo: `${window.location.origin}/auth/callback`,
        },
    });

    if (error) {
        console.error(error.message)
    }
}
