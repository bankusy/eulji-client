import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export type AuthenticatedUser = {
    authUserId: string;
    publicUserId: string;
    email: string | undefined;
    agencyId: string | null;
    role: string | null;
    fullUserData: any;
}

export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return null;
    }

    let publicUserId: string | null = null;

    // 1. Try to find user via user_identities (Robust Lookup)
    const identities = user.identities || [];
    for (const identity of identities) {
        if (!identity.provider || !identity.id) continue;

        const { data: identityRecord } = await supabase
            .from("user_identities")
            .select("user_id")
            .eq("provider", identity.provider)
            .eq("provider_user_id", identity.id)
            .single();

        if (identityRecord) {
            publicUserId = identityRecord.user_id;
            break;
        }
    }

    // 2. Fallback: Try Auth ID direct match
    if (!publicUserId) {
        const { data: userById } = await supabase
            .from("users")
            .select("id")
            .eq("id", user.id)
            .single();
        if (userById) publicUserId = userById.id;
    }

    if (!publicUserId) {
        return null;
    }

    // Get Full User Profile
    const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", publicUserId)
        .single();

    if (userError || !userData) {
        return null;
    }

    // --- Agency Resolution Logic ---
    let agencyId: string | null = null;
    let role: string | null = null;

    const cookieStore = await cookies();
    const selectedAgencyId = cookieStore.get("selected_agency_id")?.value;

    if (selectedAgencyId) {
        // Verify membership
        const { data: membership } = await supabase
            .from("agency_users")
            .select("role")
            .eq("user_id", publicUserId)
            .eq("agency_id", selectedAgencyId)
            .eq("status", "ACTIVE")
            .single();
        
        if (membership) {
            agencyId = selectedAgencyId;
            role = membership.role;
        }
    }

    // If no valid cookie, try auto-select if only 1 agency
    if (!agencyId) {
        const { data: memberships } = await supabase
            .from("agency_users")
            .select("agency_id, role")
            .eq("user_id", publicUserId)
            .eq("status", "ACTIVE");
        
        if (memberships && memberships.length === 1) {
            agencyId = memberships[0].agency_id;
            role = memberships[0].role;
            // Optionally set cookie here? Not easy in Server Component without middleware/route handler.
            // But we render with this ID.
        } else if (memberships && memberships.length === 0) {
            // No agencies at all
        } else {
            // Multiple agencies, but none selected -> force selection (agencyId stays null)
        }
    }

    return {
        authUserId: user.id,
        publicUserId: userData.id,
        email: user.email,
        agencyId: agencyId, 
        role: role,
        fullUserData: userData
    };
}

/**
 * Synchronizes the authenticated user with the public.users table.
 * If the user does not exist, they are created.
 */
export async function syncAuthenticatedUser(): Promise<AuthenticatedUser | null> {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return null;
    }

    let publicUserId: string | null = null;

    // 1. Primary Check: Auth ID Direct Match
    {
        const { data: userById } = await supabase
            .from("users")
            .select("id")
            .eq("id", user.id)
            .single();

        if (userById) {
            publicUserId = userById.id;
        }
    }

    // 2. Identity Lookup
    const identities = user.identities || [];
    if (!publicUserId) {
        for (const identity of identities) {
            if (!identity.provider || !identity.id) continue;

            const { data: identityRecord } = await supabase
                .from("user_identities")
                .select("user_id")
                .eq("provider", identity.provider)
                .eq("provider_user_id", identity.id)
                .single();

            if (identityRecord) {
                publicUserId = identityRecord.user_id;
                break;
            }
        }
    }

    // 3. Email Fallback & Sync
    if (!publicUserId && user.email) {
        const { data: userByEmail } = await supabase
            .from("users")
            .select("id")
            .eq("email", user.email)
            .single();

        if (userByEmail) {
            publicUserId = userByEmail.id;
            // Link Identity for future
            const primaryIdentity = identities[0];
            if (primaryIdentity) {
                await supabase.from("user_identities").insert({
                    user_id: publicUserId,
                    provider: primaryIdentity.provider,
                    provider_user_id: primaryIdentity.id
                });
            }
        }
    }

    // 4. Create User if still missing
    if (!publicUserId) {
        const { data: newUser, error: createError } = await supabase
            .from("users")
            .insert({
                id: user.id, // Try to sync IDs if possible
                email: user.email!,
                name: user.user_metadata.name || user.email?.split('@')[0] || 'User',
                avatar_url: user.user_metadata.avatar_url,
            })
            .select("id")
            .single();

        if (newUser) {
            publicUserId = newUser.id;
            const primaryIdentity = identities[0];
            if (primaryIdentity) {
                await supabase.from("user_identities").insert({
                    user_id: publicUserId,
                    provider: primaryIdentity.provider,
                    provider_user_id: primaryIdentity.id
                });
            }
        } else {
             // Fallback retry
             const { data: fallbackUser } = await supabase
             .from("users")
             .select("id")
             .eq("id", user.id)
             .single();
            if (fallbackUser) publicUserId = fallbackUser.id;
        }
    }

    if (!publicUserId) return null;

    // Return authenticated user immediately. 
    // We don't do agency linking here anymore as it's M:N now.
    // The getAuthenticatedUser() call will handle agency resolution.
    
    // We can call getAuthenticatedUser here to return the full object, 
    // but efficient to just return basic info if this function is only for sync.
    // Let's reuse getAuthenticatedUser logic or call it?
    // Calling it is safer to ensure consistent agency resolution logic.
    
    return await getAuthenticatedUser();
}
