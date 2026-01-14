import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Verifies if the authenticated user has access to the specified agency.
 * Returns the user object if authorized, otherwise returns null or throws.
 * 
 * @param agencyId - The ID of the agency to check access for
 * @returns Object containing user_id and role if authorized
 */
export async function verifyAgencyAccess(agencyId: string) {
    const supabase = await createSupabaseServerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return null;
    }

    // 1. Get Public User ID via identities
    let publicUserId: string | null = null;
    const identities = user.identities || [];

    for (const identity of identities) {
        if (!identity.id) continue;
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

    if (!publicUserId) return null;

    // 2. Check Membership
    const { data: membership } = await supabase
        .from("agency_users")
        .select("role")
        .eq("user_id", publicUserId)
        .eq("agency_id", agencyId)
        .eq("status", "ACTIVE")
        .single();
    
    if (!membership) return null;

    return {
        userId: publicUserId,
        role: membership.role
    };
}
