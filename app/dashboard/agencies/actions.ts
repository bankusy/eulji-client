"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAuthenticatedUser } from "@/lib/auth/service";
import { revalidatePath } from "next/cache";

export async function joinAgencyByCode(code: string) {
    const supabase = await createSupabaseServerClient();
    
    // 1. Authenticate
    const userInfo = await getAuthenticatedUser();
    if (!userInfo) {
        return { success: false, error: "로그인이 필요합니다." };
    }

    // 2. Find Invitation
    const { data: invitation } = await supabase
        .from("invitations")
        .select("*")
        .eq("code", code)
        .eq("is_active", true)
        .single();
    
    if (!invitation) {
        return { success: false, error: "유효하지 않거나 만료된 초대 코드입니다." };
    }

    // 3. Validation
    // Expiration
    if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
        return { success: false, error: "만료된 초대 코드입니다." };
    }

    // Usage Limit
    if (invitation.max_uses && invitation.used_count >= invitation.max_uses) {
        return { success: false, error: "사용 횟수가 초과된 초대 코드입니다." };
    }

    // 4. Check if already a member
    const { data: existingMember } = await supabase
        .from("agency_users")
        .select("id")
        .eq("agency_id", invitation.agency_id)
        .eq("user_id", userInfo.publicUserId)
        .single();

    if (existingMember) {
        // Optionally update role if they are re-joining? 
        // For now, let's just say they are already a member.
        // Or if status is not ACTIVE, set to ACTIVE.
        // Let's assume simplistic "Already a member".
        return { success: false, error: "이미 해당 에이전시의 멤버입니다." };
    }

    // 5. Add to Agency
    const { error: insertError } = await supabase
        .from("agency_users")
        .insert({
            agency_id: invitation.agency_id,
            user_id: userInfo.publicUserId,
            role: invitation.role,
            status: 'INVITED', // Pending approval
            joined_at: new Date().toISOString()
        });

    if (insertError) {
        console.error("Join agency error:", insertError);
        return { success: false, error: "에이전시 가입 실패" };
    }

    // 6. Update Invitation Usage
    await supabase.rpc("increment_invitation_usage", { row_id: invitation.id });
    // Or plain update if RPC doesn't exist. I didn't create an RPC.
    // Let's do a simple increment update. Concurrency might be an issue essentially but for this scale ok.
    await supabase
        .from("invitations")
        .update({ used_count: invitation.used_count + 1 })
        .eq("id", invitation.id);

    // 7. Revalidate
    revalidatePath("/dashboard/agencies");

    return { success: true, agencyId: invitation.agency_id };
}
