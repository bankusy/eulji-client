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

    // 1. Optimistic Check: Try using Auth ID directly as User ID
    // This covers the standard case where auth.users.id === public.users.id
    const { data: directMembership } = await supabase
        .from("agency_users")
        .select("role")
        .eq("user_id", user.id)
        .eq("agency_id", agencyId)
        .eq("status", "ACTIVE")
        .maybeSingle(); // Use maybeSingle to avoid error if not found

    if (directMembership) {
        return {
            userId: user.id,
            role: directMembership.role
        };
    }

    // 2. Fallback: Lookup Public User ID via identities (Legacy/Complex Auth)
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
    
    // Avoid re-checking if publicUserId is same as user.id (already checked above)
    if (publicUserId === user.id) return null; 

    // 3. Check Membership with resolved Public ID
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
