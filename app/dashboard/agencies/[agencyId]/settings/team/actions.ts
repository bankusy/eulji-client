"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getAuthenticatedUser } from "@/lib/auth/service";

export async function createInvitation(agencyId: string, role: string = "MEMBER") {
    const supabase = await createSupabaseServerClient();

    // 1. Check permissions (Must be OWNER or ADMIN)
    // Use getAuthenticatedUser to ensure we have the correct publicUserId relative to the DB
    const userInfo = await getAuthenticatedUser();
    if (!userInfo) return { success: false, error: "Unauthorized" };

    const { data: membership } = await supabase
        .from("agency_users")
        .select("role")
        .eq("agency_id", agencyId)
        .eq("user_id", userInfo.publicUserId) 
        .single();

    if (!membership || (membership.role !== "OWNER" && membership.role !== "ADMIN")) {
        return { success: false, error: "권한이 없습니다." };
    }

    // 2. Generate Code (Simple random string)
    // Format: TEAM-XXXX-XXXX
    const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
    const code = `INV-${randomPart}`;

    // 3. Insert
    const { data, error } = await supabase
        .from("invitations")
        .insert({
            agency_id: agencyId,
            code: code,
            role: role,
            created_by: userInfo.publicUserId
        })
        .select()
        .single();

    if (error) {
        console.error("Failed to create invitation:", error);
        return { success: false, error: "초대 코드 생성 실패" };
    }

    revalidatePath(`/dashboard/agencies/${agencyId}/settings/team`);
    return { success: true, data };
}

export async function revokeInvitation(invitationId: string, agencyId: string) {
    const supabase = await createSupabaseServerClient();

    const userInfo = await getAuthenticatedUser();
    if (!userInfo) return { success: false, error: "Unauthorized" };

    const { data: membership } = await supabase
        .from("agency_users")
        .select("role")
        .eq("agency_id", agencyId)
        .eq("user_id", userInfo.publicUserId)
        .single();

    if (!membership || (membership.role !== "OWNER" && membership.role !== "ADMIN")) {
        return { success: false, error: "권한이 없습니다." };
    }

    const { error } = await supabase
        .from("invitations")
        .update({ is_active: false })
        .eq("id", invitationId)
        .eq("agency_id", agencyId); // Extra safety

    if (error) {
        return { success: false, error: "초대 코드 삭제 실패" };
    }

    revalidatePath(`/dashboard/agencies/${agencyId}/settings/team`);
    return { success: true };
}

export async function updateMemberRole(targetUserId: string, agencyId: string, newRole: string) {
    const supabase = await createSupabaseServerClient();
    
    // 1. Authenticate Requester
    const userInfo = await getAuthenticatedUser();
    if (!userInfo) return { success: false, error: "Unauthorized" };

    // 2. Fetch Requester's Role
    const { data: requester } = await supabase
        .from("agency_users")
        .select("role")
        .eq("agency_id", agencyId)
        .eq("user_id", userInfo.publicUserId)
        .single();

    if (!requester) return { success: false, error: "권한이 없습니다." };

    // 3. Fetch Target's current role
    const { data: target } = await supabase
        .from("agency_users")
        .select("role")
        .eq("agency_id", agencyId)
        .eq("user_id", targetUserId)
        .single();
    
    if (!target) return { success: false, error: "대상 사용자를 찾을 수 없습니다." };

    // 4. Permission Logic
    // OWNER can manage everything except other OWNERs (unless we want multi-owner support, but usually singular).
    // Let's assume Owner can demote Admin/Member.
    if (requester.role === "OWNER") {
        if (target.role === "OWNER" && targetUserId !== userInfo.publicUserId) {
            return { success: false, error: "다른 소유자의 권한은 변경할 수 없습니다." };
        }
        // Owner can proceed
    } else {
        // ADMIN or MEMBER cannot change roles currently
        return { success: false, error: "권한이 없습니다. (소유자만 가능)" };
    }
    
    // Prevent self-demotion if Owner (unless transferring ownership, which is complex)
    if (requester.role === "OWNER" && targetUserId === userInfo.publicUserId && newRole !== "OWNER") {
         return { success: false, error: "자신의 역할은 변경할 수 없습니다. (소유권 이전 필요)" };
    }

    const { error } = await supabase
        .from("agency_users")
        .update({ role: newRole })
        .eq("agency_id", agencyId)
        .eq("user_id", targetUserId);

    if (error) {
        return { success: false, error: "권한 변경 실패" };
    }

    revalidatePath(`/dashboard/agencies/${agencyId}/settings/team`);
    return { success: true };
}

export async function approveMember(targetUserId: string, agencyId: string) {
    const supabase = await createSupabaseServerClient();
    
    // 1. Authenticate Requester
    const userInfo = await getAuthenticatedUser();
    if (!userInfo) return { success: false, error: "Unauthorized" };

    // 2. Fetch Requester's Role
    const { data: requester } = await supabase
        .from("agency_users")
        .select("role")
        .eq("agency_id", agencyId)
        .eq("user_id", userInfo.publicUserId)
        .single();

    if (!requester || (requester.role !== "OWNER" && requester.role !== "ADMIN")) {
        return { success: false, error: "권한이 없습니다." };
    }

    const { error } = await supabase
        .from("agency_users")
        .update({ status: 'ACTIVE', joined_at: new Date().toISOString() })
        .eq("agency_id", agencyId)
        .eq("user_id", targetUserId);

    if (error) {
        return { success: false, error: "승인 실패" };
    }

    revalidatePath(`/dashboard/agencies/${agencyId}/settings/team`);
    return { success: true };
}

export async function rejectMember(targetUserId: string, agencyId: string) {
    const supabase = await createSupabaseServerClient();
    
    // 1. Authenticate Requester
    const userInfo = await getAuthenticatedUser();
    if (!userInfo) return { success: false, error: "Unauthorized" };

    // 2. Fetch Requester's Role
    const { data: requester } = await supabase
        .from("agency_users")
        .select("role")
        .eq("agency_id", agencyId)
        .eq("user_id", userInfo.publicUserId)
        .single();

    if (!requester || (requester.role !== "OWNER" && requester.role !== "ADMIN")) {
        return { success: false, error: "권한이 없습니다." };
    }

    // Completely remove the invited record
    const { error } = await supabase
        .from("agency_users")
        .delete()
        .eq("agency_id", agencyId)
        .eq("user_id", targetUserId)
        .eq("status", "INVITED"); // Safety check to only delete invites

    if (error) {
        return { success: false, error: "거절 실패" };
    }

    revalidatePath(`/dashboard/agencies/${agencyId}/settings/team`);
    return { success: true };
}
