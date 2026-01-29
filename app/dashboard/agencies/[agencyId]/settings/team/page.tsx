"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useUserStore } from "@/hooks/useUserStore";
import { AgencyUser } from "@/types/agency";
import { Invitation } from "@/types/invitation";
import { createInvitation, revokeInvitation, updateMemberRole, approveMember, rejectMember } from "./actions";
import { Button } from "@/components/ui/v1/Button";
import { Badge } from "@/components/ui/Badge";
import GlobalLoader from "@/components/ui/GlobalLoader";
import { Trash2, Copy, Plus, MoreHorizontal, Check, X } from "lucide-react";
import clsx from "clsx";

export default function TeamPage() {
    const params = useParams();
    const agencyId = params.agencyId as string;
    const router = useRouter();

    const [isCreating, setIsCreating] = useState(false);
    const { user } = useUserStore();

    // Fetch Current User Role
    const { data: myRole, isLoading: roleLoading } = useQuery({
        queryKey: ["myRole", agencyId, user?.id],
        queryFn: async () => {
            if (!user?.id) return null;
            const supabase = createSupabaseBrowserClient();
            
            const { data } = await supabase
                .from("agency_users")
                .select("role")
                .eq("agency_id", agencyId)
                .eq("user_id", user.id)
                .single();
            return data?.role;
        },
        enabled: !!user?.id
    });

    // Fetch Members
    const { data: members, refetch: refetchMembers, isLoading: membersLoading } = useQuery({
        queryKey: ["agencyMembers", agencyId],
        queryFn: async () => {
            const supabase = createSupabaseBrowserClient();
            const { data, error } = await supabase
                .from("agency_users")
                .select(`
                    *,
                    users (
                        name,
                        email,
                        avatar_url
                    )
                `)
                .eq("agency_id", agencyId)
                .order("created_at", { ascending: true });
            
            if (error) throw error;
            return data as any[]; 
        },
        enabled: !!agencyId
    });

    // Fetch Invitations
    const { data: invitations, refetch: refetchInvitations, isLoading: invitesLoading } = useQuery({
        queryKey: ["agencyInvitations", agencyId],
        queryFn: async () => {
            const supabase = createSupabaseBrowserClient();
            const { data, error } = await supabase
                .from("invitations")
                .select("*")
                .eq("agency_id", agencyId)
                .eq("is_active", true)
                .order("created_at", { ascending: false });
            
            if (error) throw error;
            
            // Allow manual typing if needed, or rely on inference
            return data as Invitation[];
        },
        enabled: !!agencyId
    });

    const handleCreateInvite = async () => {
        setIsCreating(true);
        try {
            const res = await createInvitation(agencyId, "MEMBER");
            if (res.success) {
                refetchInvitations();
            } else {
                alert(res.error || "실패했습니다.");
            }
        } catch (e) {
            console.error(e);
            alert("오류가 발생했습니다.");
        } finally {
            setIsCreating(false);
        }
    };

    const handleRevokeInvite = async (id: string) => {
        if (!confirm("정말 이 초대 코드를 삭제하시겠습니까?")) return;
        try {
            const res = await revokeInvitation(id, agencyId);
            if (res.success) {
                refetchInvitations();
            } else {
                alert(res.error);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("복사되었습니다.");
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "-";
        return new Intl.DateTimeFormat("ko-KR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        }).format(new Date(dateString));
    };

    if (roleLoading || membersLoading) return <GlobalLoader />;
    
    
    // Access Control
    if (myRole !== "OWNER" && myRole !== "ADMIN") {
        return (
            <div className="p-8 text-center text-(--foreground-muted)">
                접근 권한이 없습니다.
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-(--background) overflow-hidden">
            {/* Header */}
            <header className="py-6 border-b border-(--border-surface)">
                <h1 className="text-2xl font-bold text-(--foreground)">팀 관리</h1>
                <p className="text-(--foreground-muted) mt-1">
                    함께 일할 팀원을 초대하고 권한을 관리하세요.
                </p>
            </header>

            <div className="flex-1 overflow-auto space-y-10">
                {/* Members Section */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-(--foreground)">팀원 목록</h2>
                        <span className="text-sm text-(--foreground-muted)">
                            총 {members?.length || 0}명
                        </span>
                    </div>
                    
                    <div className="rounded-xl border border-(--border-surface) bg-(--background-surface) overflow-hidden">
                        <div className="w-full overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-(--foreground-muted) uppercase bg-(--background-subtle) border-b border-(--border-subtle)">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">이름</th>
                                        <th className="px-6 py-3 font-medium">이메일</th>
                                        <th className="px-6 py-3 font-medium">권한</th>
                                        <th className="px-6 py-3 font-medium">가입일</th>
                                        <th className="px-6 py-3 font-medium w-[100px]"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-(--border-subtle)">
                                    {members?.map((member) => {
                                        const isInvited = member.status === "INVITED";
                                        return (
                                        <tr key={member.id} className={clsx("bg-(--background-surface) hover:bg-(--background-subtle/50)", isInvited && "bg-yellow-50/50 dark:bg-yellow-900/10")}>
                                            <td className="px-6 py-4 font-medium text-(--foreground)">
                                                {member.users?.name || "알 수 없음"}
                                                {member.user_id === member.users?.id && " (나)"}
                                                {isInvited && <span className="ml-2 text-[10px] bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded border border-yellow-200">승인 대기</span>}
                                            </td>
                                            <td className="px-6 py-4 text-(--foreground-muted)">
                                                {member.email || member.users?.email}
                                            </td>
                                            <td className="px-6 py-4">
                                                {/* Role Management UI - Only show for Active members OR show intended role for invited */}
                                                {!isInvited && myRole === "OWNER" && member.role !== "OWNER" ? (
                                                     <div className="relative w-fit">
                                                        <select
                                                            value={member.role}
                                                            onChange={async (e) => {
                                                                if (confirm(`${member.users?.name || "사용자"}의 권한을 ${e.target.value}로 변경하시겠습니까?`)) {
                                                                    const res = await updateMemberRole(member.user_id, agencyId, e.target.value);
                                                                    if (res.success) {
                                                                        refetchMembers();
                                                                    } else {
                                                                        alert(res.error || "변경 실패");
                                                                    }
                                                                } else {
                                                                    e.target.value = member.role; // Reset on cancel
                                                                }
                                                            }}
                                                            className={clsx(
                                                                "appearance-none pl-3 pr-8 py-1 rounded-full text-xs font-medium border cursor-pointer focus:outline-none focus:ring-2 focus:ring-(--primary/20)",
                                                                member.role === "ADMIN" 
                                                                    ? "bg-(--background-subtle) border-transparent text-(--foreground)" 
                                                                    : "bg-transparent border-(--border) text-(--foreground-muted)"
                                                            )}
                                                        >
                                                            <option value="MEMBER">MEMBER</option>
                                                            <option value="ADMIN">ADMIN</option>
                                                        </select>
                                                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-(--foreground-muted)">
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                                        </div>
                                                     </div>
                                                ) : (
                                                    <Badge variant={member.role === "OWNER" ? "default" : member.role === "ADMIN" ? "secondary" : "outline"}>
                                                        {member.role}
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-(--foreground-muted)">
                                                {formatDate(member.created_at)}
                                            </td>
                                            <td className="px-6 py-4">
                                                {isInvited && (myRole === "OWNER" || myRole === "ADMIN") && (
                                                    <div className="flex gap-2 justify-end">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="text-green-600 hover:text-green-700 hover:bg-green-50 h-8 w-8 p-0"
                                                            onClick={async () => {
                                                                if(confirm("이 사용자의 가입을 승인하시겠습니까?")) {
                                                                    const res = await approveMember(member.user_id, agencyId);
                                                                    if(res.success) refetchMembers();
                                                                    else alert(res.error);
                                                                }
                                                            }}
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 w-8 p-0"
                                                            onClick={async () => {
                                                                if(confirm("이 사용자의 가입 요청을 거절하시겠습니까?")) {
                                                                    const res = await rejectMember(member.user_id, agencyId);
                                                                    if(res.success) refetchMembers();
                                                                    else alert(res.error);
                                                                }
                                                            }}
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    )})}
                                    {members?.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-(--foreground-muted)">
                                                팀원이 없습니다.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                {/* Invitations Section */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-semibold text-(--foreground)">초대 코드 관리</h2>
                            <p className="text-sm text-(--foreground-muted) mt-1">
                                유효한 초대 코드를 가진 사용자는 멤버로 가입할 수 있습니다.
                            </p>
                        </div>
                        <Button onClick={handleCreateInvite} disabled={isCreating}>
                            <Plus className="w-4 h-4 mr-2" />
                            새 초대 코드 생성
                        </Button>
                    </div>

                    <div className="rounded-xl border border-(--border-surface) bg-(--background-surface) overflow-hidden">
                        <div className="w-full overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-(--foreground-muted) uppercase bg-(--background-subtle) border-b border-(--border-subtle)">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">초대 코드</th>
                                        <th className="px-6 py-3 font-medium">역할</th>
                                        <th className="px-6 py-3 font-medium">사용 횟수</th>
                                        <th className="px-6 py-3 font-medium">생성일</th>
                                        <th className="px-6 py-3 font-medium text-right">관리</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-(--border-subtle)">
                                    {invitations?.map((invite) => (
                                        <tr key={invite.id} className="bg-(--background-surface) hover:bg-(--background-subtle/50)">
                                            <td className="px-6 py-4 font-mono font-medium text-lg tracking-wider text-(--foreground)">
                                                {invite.code}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant="outline">{invite.role}</Badge>
                                            </td>
                                            <td className="px-6 py-4 text-(--foreground-muted)">
                                                {invite.used_count}회 사용됨
                                                {invite.max_uses ? ` / ${invite.max_uses}회 가능` : ""}
                                            </td>
                                            <td className="px-6 py-4 text-(--foreground-muted)">
                                                {formatDate(invite.created_at)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button 
                                                        size="sm" 
                                                        variant="ghost" 
                                                        onClick={() => copyToClipboard(invite.code)}
                                                    >
                                                        <Copy className="w-4 h-4" />
                                                    </Button>
                                                    <Button 
                                                        size="sm" 
                                                        variant="ghost" 
                                                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                        onClick={() => handleRevokeInvite(invite.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {(!invitations || invitations.length === 0) && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center gap-2 text-(--foreground-muted)">
                                                    <p>활성화된 초대 코드가 없습니다.</p>
                                                    <Button variant="outline" size="sm" onClick={handleCreateInvite}>
                                                        코드 생성하기
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
