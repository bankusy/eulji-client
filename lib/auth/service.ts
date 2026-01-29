import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SupabaseClient, User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { cache } from "react";

export type AuthenticatedUser = {
    authUserId: string;
    publicUserId: string;
    email: string | undefined;
    agencyId: string | null;
    role: string | null;
    fullUserData: any;
}

export const getAuthenticatedUser = cache(async (
    prefetchedUser?: User | null,
    options?: { requiredAgencyId?: string }
): Promise<AuthenticatedUser | null> => {
    const supabase = await createSupabaseServerClient();
    
    let user: User | null = prefetchedUser || null;

    if (!user) {
        const { data: { user: fetchedUser }, error: authError } = await supabase.auth.getUser();
        if (authError || !fetchedUser) {
            return null;
        }
        user = fetchedUser;
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
    let status: string | null = null;

    // A. Priority: Required Agency ID (Contextual Fetching for Strict Access)
    if (options?.requiredAgencyId) {
        const { data: membership } = await supabase
            .from("agency_users")
            .select("role, status")
            .eq("user_id", publicUserId)
            .eq("agency_id", options.requiredAgencyId)
            // We fetch the status to decide, but we might filter here if we only want ACTIVE?
            // Usually we return everything and let caller decide, BUT `agencyId` in return object usually implies "Active Context".
            // Let's fetch it regardless.
            .single();
        
        if (membership) {
            // Note: If status is INVITED, we still return the ID, but the caller (layout) handles the denial.
            // OR: We only set agencyId if ACTIVE?
            // Let's set it, and let caller check role/status. 
            // Wait, the return type doesn't have `status`.
            // We should probably check if status is ACTIVE here to be safe for "Context".
            
            // If we are strictly "Selecting" this agency, we usually want to know if we are a member.
            agencyId = options.requiredAgencyId;
            role = membership.role;
            // We might need to expose status if we want Layout to redirect.
            // For now, let's stick to existing type, but if status is !ACTIVE, maybe we return null for agencyId?
            // The existing `getAuthenticatedUser` filtered for `status=ACTIVE` in cookie logic.
            // So we should probably do the same here to match behavior.
            
            if (membership.status === 'ACTIVE') {
                 // All good
            } else {
                 // User exists but not active. 
                 // If we return agencyId, the caller assumes valid context.
                 // But wait, `AgencyDashboardLayout` needs to distinguish "Not Member" vs "Invited".
                 // Currently it does a separate query. 
                 // If we want to optimize, we should trust this query.
                 // But the return type implies "Current Active Agency".
                 // Let's stick to: If not ACTIVE, we don't set agencyId (it acts as if not selected).
                 // CALLER (Layout) can checking explicit agencyId needs to know failure reason.
                 // This function returns `AuthenticatedUser`.
                 // Maybe we shouldn't mix "Verification" with "Comparison".
                 
                 // If `requiredAgencyId` is passed, we populate `agencyId` ONLY if valid. 
                 // If invalid/invited, `agencyId` will be null, and Layout will see `null` vs `requiredAgencyId` mismatch.
                 if (membership.status !== 'ACTIVE') {
                     agencyId = null; 
                     role = null;
                 }
            }
        }
    } 
    // B. Cookie Selection
    else {
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
    }

    // C. Auto Select (if no agency determined yet)
    if (!agencyId && !options?.requiredAgencyId) { // Only auto-select if we weren't forced to check a specific one
        const { data: memberships } = await supabase
            .from("agency_users")
            .select("agency_id, role")
            .eq("user_id", publicUserId)
            .eq("status", "ACTIVE");
        
        if (memberships && memberships.length === 1) {
            agencyId = memberships[0].agency_id;
            role = memberships[0].role;
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
});

/**
 * Synchronizes the authenticated user with the public.users table.
 * If the user does not exist, they are created.
 */
export async function syncAuthenticatedUser(prefetchedUser?: User | null): Promise<AuthenticatedUser | null> {
    const supabase = await createSupabaseServerClient();
    
    let user: User | null = prefetchedUser || null;

    if (!user) {
        const { data: { user: fetchedUser }, error: authError } = await supabase.auth.getUser();
        if (authError || !fetchedUser) {
            return null;
        }
        user = fetchedUser;
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
    
    return await getAuthenticatedUser(user);
}
