"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { verifyAgencyAccess } from "@/lib/auth/agency";
import { revalidatePath } from "next/cache";

export async function refreshInviteCode(agencyId: string) {
    // 1. Authorization: Verify user is OWNER of the agency
    const auth = await verifyAgencyAccess(agencyId);
    if (!auth || auth.role !== "OWNER") {
        throw new Error("Unauthorized: Only owners can manage invite codes");
    }

    const supabase = await createSupabaseServerClient();
    
    // 2. Generate new code
    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // 3. Update DB
    const { error } = await supabase
        .from("agencies")
        .update({ invite_code: newCode })
        .eq("id", agencyId);

    if (error) {
        console.error("Error refreshing invite code:", error);
        throw new Error("Failed to refresh invite code");
    }

    // 4. Revalidate cache
    revalidatePath(`/dashboard/agencies/${agencyId}/settings`);

    return { success: true, newCode };
}
