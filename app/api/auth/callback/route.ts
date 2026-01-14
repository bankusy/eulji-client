import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const url = new URL(req.url);

    const code = url.searchParams.get("code");
    const error = url.searchParams.get("error");
    const errorDescription = url.searchParams.get("error_description");

    if (error) {
        console.error("Auth callback error:", error, errorDescription);
        return NextResponse.redirect(
            new URL(`/auth/login?error=${encodeURIComponent(error)}&error_description=${encodeURIComponent(errorDescription || "")}`, url.origin)
        );
    }

    if (code) {
        const supabase = await createSupabaseServerClient();
        const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

        if (sessionError) {
            console.error("Session exchange error:", sessionError);
            return NextResponse.redirect(
                new URL("/auth/login?error=session_exchange", url.origin)
            );
        }

        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            console.error("User fetch error:", userError);
            return NextResponse.redirect(
                new URL("/auth/login?error=user_fetch", url.origin)
            );
        }

        // ------------------------------------------------------------------
        // Generic Provider Sync Logic
        // ------------------------------------------------------------------

        // 1. Identify Provider & Provider User ID
        // We look for the most recently used identity or try to infer from metadata.
        // `user.identities` usually contains the linked identities.
        // For a just-completed OAuth login, the token usually updates `last_sign_in_at` in identities?
        // Actually, Supabase doesn't strictly guarantee order or `last_sign_in_at` on identity level easily in this object.
        // However, usually we can look for the identity that matches `user.app_metadata.provider` IF it exists there,
        // or iterate through identities.
        // A robust way: Iterate all identities and sync them all.
        // For this callback context, we want to ensure the CURRENT one is synced.

        const identities = user.identities || [];

        if (identities.length === 0) {
            // Email/Password login (no provider identity in the OAuth sense usually, unless uuid is provider)
            // But this callback is for OAuth flow (exchangeCodeForSession).
            console.warn("No identities found for user.");
            return NextResponse.redirect(new URL("/", url.origin));
        }

        // Ideally we sync ALL identities to ensure consistency, 
        // but let's focus on identifying the one that likely triggered this flow.
        // Typically it's the one with `last_sign_in_at` closest to now, 
        // OR we just ensure all of them exist in our DB.
        // Let's loop through ALL available identities and ensure they are linked.

        const email = user.email;
        const name = user.user_metadata.full_name || user.user_metadata.name || email?.split("@")[0] || "No Name";
        const avatarUrl = user.user_metadata.avatar_url;

        if (!email) {
            console.error("No email provided from Auth");
            return NextResponse.redirect(new URL("/auth/login?error=no_email", url.origin));
        }

        // 2. Identify Target User in public.users
        // First, check if we already have a user for this email.
        const { data: existingUser, error: existingUserError } = await supabase
            .from("users")
            .select("id")
            .eq("email", email)
            .maybeSingle();

        if (existingUserError) {
            console.error("User check error:", existingUserError);
            return NextResponse.redirect(new URL("/auth/login?error=db_error", url.origin));
        }

        let targetUserId = existingUser?.id;

        // 3. Create User if missing
        if (!targetUserId) {
            const { data: newUser, error: createUserError } = await supabase
                .from("users")
                .insert({
                    email: email,
                    name: name,
                    avatar_url: avatarUrl,
                    // role/status defaults
                })
                .select("id")
                .single();

            if (createUserError) {
                console.error("Create user error:", createUserError);
                return NextResponse.redirect(new URL("/auth/login?error=create_user_failed", url.origin));
            }
            targetUserId = newUser.id;
        } else {
            // Optional: Update name/avatar if changed? Let's skip for now to avoid overwriting user edits.
        }

        // 4. Sync Identities
        // Iterate over all identities from Supabase Auth and ensure they exist in public.user_identities
        for (const identity of identities) {
            const provider = identity.provider; // e.g., 'google', 'kakao'
            const providerUserId = identity.id; // e.g., '12345...'

            // Check if this identity link exists
            const { data: existingLink, error: linkCheckError } = await supabase
                .from("user_identities")
                .select("id")
                .eq("provider", provider)
                .eq("provider_user_id", providerUserId)
                .maybeSingle();

            if (!existingLink && !linkCheckError) {
                // Link it
                const { error: linkError } = await supabase
                    .from("user_identities")
                    .insert({
                        user_id: targetUserId,
                        provider: provider,
                        provider_user_id: providerUserId
                    });

                if (linkError) {
                    console.error(`Failed to link identity ${provider} for user ${targetUserId}:`, linkError);
                } else {
                }
            }
        }

        const next = url.searchParams.get("next") || "/dashboard";
        return NextResponse.redirect(new URL(next, url.origin));
    }

    return NextResponse.redirect(new URL("/auth/login?error=no_code", url.origin));
}
