"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ThemeHook from "@/hooks/ThemeHook";
import { Button } from "@/components/ui/v1/Button";

import { Agency } from "@/types/agency";
import Input from "@/components/ui/v1/Input";
import GlobalLoader from "@/components/ui/GlobalLoader";
import { joinAgencyByCode } from "./actions";
import clsx from "clsx";

// Local type extended if needed, but for now referencing shared type
// type Agency = { ... } // Removed local definition

export default function AgencySelectPage() {
    const router = useRouter();
    const { systemTheme } = ThemeHook();

    // Fetch user's agencies
    const { data: agencies, isLoading } = useQuery({
        queryKey: ["myAgencies"],
        queryFn: async () => {
            const supabase = createSupabaseBrowserClient();
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) {
                // Should redirect to login
                return [];
            }

            // Fetch public id via user_identities
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

            if (!publicUserId) {
                console.error(
                    "No public user found for identities",
                    identities
                );
                return [];
            }

            // 1. Get memberships
            const { data: memberships, error: membershipError } = await supabase
                .from("agency_users")
                .select("agency_id, role, status")
                .eq("user_id", publicUserId)
                .in("status", ["ACTIVE", "INVITED"]);

            if (membershipError || !memberships?.length) {
                console.error(
                    "Membership fetch error or empty",
                    membershipError
                );
                return [];
            }

            const agencyIds = memberships.map((m: any) => m.agency_id);

            // 2. Get agencies
            const { data: agenciesData, error: agencyError } = await supabase
                .from("agencies")
                .select("id, name, created_at")
                .in("id", agencyIds);

            if (agencyError) {
                console.error("Agency fetch error", agencyError);
                return [];
            }

            // 3. Merge
            return agenciesData.map((agency: any) => {
                const membership = memberships.find(
                    (m: any) => m.agency_id === agency.id
                );
                return {
                    id: agency.id,
                    name: agency.name,
                    created_at: agency.created_at,
                    role: membership?.role || "MEMBER",
                    // Adding proprietary property for UI state, even if not in strict Agency type yet? 
                    // Better to cast or extend type locally if strict.
                    // The generic Agency type might not have status. 
                    // Let's rely on JS dynamic nature or add to type if needed.
                    status: membership?.status
                };
            }) as (Agency & { status: string })[];
        },
    });

    const [isNavigating, setIsNavigating] = useState(false);

    // Creation State
    const [isCreatingAgency, setIsCreatingAgency] = useState(false);
    const [newAgencyName, setNewAgencyName] = useState("");
    
    // Join State
    const [isJoiningAgency, setIsJoiningAgency] = useState(false);
    const [joinCode, setJoinCode] = useState("");

    const [isCreating, setIsCreating] = useState(false);

    const handleSelect = async (agencyId: string) => {
        setIsNavigating(true);
        try {
            const res = await fetch("/api/auth/switch-agency", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ agencyId }),
            });
            if (res.ok) {
                // router.push("/dashboard");
                // Now we redirect to specific agency dashboard URL
                router.push(`/dashboard/agencies/${agencyId}/overview`);
                router.refresh();
            } else {
                alert("Failed to switch agency");
                setIsNavigating(false);
            }
        } catch (e) {
            console.error(e);
            setIsNavigating(false);
        }
    };

    const handleCreateAgency = async () => {
        if (!newAgencyName.trim()) return;
        setIsCreating(true);
        try {
            const res = await fetch("/api/agencies", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newAgencyName }),
            });
            
            if (res.ok) {
                const data = await res.json();
                alert("성공적으로 생성되었습니다.");
                // Redirect to the new agency dashboard
                router.push(`/dashboard/agencies/${data.agencyId}/overview`);
                router.refresh();
            } else {
                const data = await res.json();
                alert(data.error || "생성에 실패했습니다.");
                setIsCreating(false);
            }
        } catch (e) {
            console.error(e);
            alert("오류가 발생했습니다.");
            setIsCreating(false);
        }
    };

    const handleJoinAgency = async () => {
        if (!joinCode.trim()) return;
        setIsCreating(true); // Reuse loading state
        try {
            const res = await joinAgencyByCode(joinCode.trim());
            if (res.success && res.agencyId) {
                alert("성공적으로 가입되었습니다.");
                router.push(`/dashboard/agencies/${res.agencyId}/overview`);
                router.refresh();
            } else {
                alert(res.error || "가입 실패");
                setIsCreating(false);
            }
        } catch (e) {
            console.error(e);
            alert("오류가 발생했습니다.");
            setIsCreating(false);
        }
    };

    const ownedCount = agencies?.filter((a) => a.role === "OWNER").length || 0;
    const canCreate = ownedCount < 5;

    return (
        <div className="fixed inset-0 z-50 bg-(--background) flex flex-col items-center justify-center p-6">
            {(isLoading || isNavigating || isCreating) && <GlobalLoader />}
            <div className="w-full max-w-4xl">
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold mb-2 text-(--foreground)">
                        에이전시 선택
                    </h1>
                    <p className="text-(--foreground-muted)">
                        관리할 에이전시를 선택하거나 새로 만드세요.
                    </p>
                </div>

                {isCreatingAgency ? (
                    <div className="flex flex-col w-full max-w-md mx-auto bg-(--background) p-6 rounded-xl border border-(--border-surface) shadow-sm space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold text-(--foreground) mb-1">
                                새 에이전시 생성
                            </h3>
                            <p className="text-sm text-(--foreground-muted)">
                                기본 플랜(Free)으로 시작합니다. (보유 한도: {ownedCount}/5)
                            </p>
                        </div>
                        <div className="w-full">
                            <Input
                            className="w-full"
                                placeholder="에이전시 이름"
                                value={newAgencyName}
                                onChange={(e) =>
                                    setNewAgencyName(e.target.value)
                                }
                                autoFocus
                            />
                        </div>
                        <div className="flex gap-2 justify-end pt-2">
                            <Button
                                variant="ghost"
                                onClick={() => setIsCreatingAgency(false)}
                            >
                                취소
                            </Button>
                            <Button
                                onClick={handleCreateAgency}
                                disabled={isCreating || !newAgencyName.trim()}
                            >
                                {isCreating ? "생성 중..." : "생성하기"}
                            </Button>
                        </div>
                    </div>
                ) : isJoiningAgency ? (
                    <div className="flex flex-col w-full max-w-md mx-auto bg-(--background) p-6 rounded-xl border border-(--border-surface) shadow-sm space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold text-(--foreground) mb-1">
                                초대 코드로 참여
                            </h3>
                            <p className="text-sm text-(--foreground-muted)">
                                전달받은 초대 코드를 입력하세요.
                            </p>
                        </div>
                        <div className="w-full">
                            <Input
                                className="w-full text-center uppercase font-mono tracking-widest text-lg py-3"
                                placeholder="INV-XXXX-XXXX"
                                value={joinCode}
                                onChange={(e) =>
                                    setJoinCode(e.target.value)
                                }
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleJoinAgency();
                                }}
                            />
                        </div>
                        <div className="flex gap-2 justify-end pt-2">
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    setIsJoiningAgency(false);
                                    setJoinCode("");
                                }}
                            >
                                취소
                            </Button>
                            <Button
                                onClick={handleJoinAgency}
                                disabled={isCreating || !joinCode.trim()}
                            >
                                {isCreating ? "참여 중..." : "참여하기"}
                            </Button>
                        </div>
                    </div>
                ) : (
                    !isLoading && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {agencies?.map((agency) => {
                                const isInvited = (agency as any).status === "INVITED";
                                return (
                                <div
                                    key={agency.id}
                                    className={`
                                        aspect-[16/9] p-5 border rounded-xl transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden
                                        ${isInvited 
                                            ? "bg-(--background) border-dashed border-(--border-subtle) opacity-80" 
                                            : "bg-(--background-surface) border-(--border-surface) hover:ring-2 hover:ring-(--primary/20) hover:border-(--primary/50)"
                                        }
                                    `}
                                    onClick={() => {
                                        if (isInvited) {
                                            alert("승인 대기 중입니다. 관리자의 승인을 기다려주세요.");
                                        } else {
                                            handleSelect(agency.id);
                                        }
                                    }}
                                >
                                    <div className="flex flex-col gap-3 items-start w-full z-10">
                                        <div className="flex justify-between w-full items-start">
                                            <h3 className="font-bold text-lg text-(--foreground) truncate pr-2">
                                                {agency.name}
                                            </h3>
                                            {!isInvited && (
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-(--primary)">
                                                     <Image
                                                        src={`/icons/chevron/dark.svg`}
                                                        width={20}
                                                        height={20}
                                                        alt="Go"
                                                        className="-rotate-90 opacity-50 block dark:hidden"
                                                    />
                                                     <Image
                                                        src={`/icons/chevron/light.svg`}
                                                        width={20}
                                                        height={20}
                                                        alt="Go"
                                                        className="-rotate-90 hidden dark:block"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="flex gap-2 mt-auto">
                                            <span className={clsx(
                                                "text-[11px] px-2 py-0.5 rounded-full border font-medium",
                                                agency.role === "OWNER" 
                                                    ? "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800" 
                                                    : "bg-(--background-subtle) text-(--foreground-muted) border-(--border-subtle)"
                                            )}>
                                                {agency.role === "OWNER" ? "소유자" : "멤버"}
                                            </span>
                                            {isInvited && (
                                                <span className="text-[11px] px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800 font-medium">
                                                    승인 대기
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )})}

                            <button
                                onClick={() => canCreate && setIsCreatingAgency(true)}
                                disabled={!canCreate}
                                className={clsx(
                                    "aspect-video p-5 border border-dashed rounded-xl flex flex-col items-center justify-center gap-3 transition-all",
                                    canCreate 
                                        ? "border-(--border-subtle) bg-(--background-subtle/30) hover:bg-(--background-subtle) hover:border-(--border-surface-hover) cursor-pointer group"
                                        : "border-(--border-subtle) bg-(--background-subtle) opacity-50 cursor-not-allowed"
                                )}
                            >
                                <div className={clsx(
                                    "w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110",
                                    canCreate ? "bg-(--primary) text-(--primary-foreground)" : "bg-(--foreground-muted) text-(--background)"
                                )}>
                                    <span className="text-2xl leading-none pb-1">+</span>
                                </div>
                                <div className="text-center">
                                    <span className="block text-sm font-semibold text-(--foreground)">
                                        새 에이전시 {canCreate ? "만들기" : "불가"}
                                    </span>
                                    <span className="block text-xs text-(--foreground-muted) mt-1">
                                        보유 한도: {ownedCount}/5
                                    </span>
                                </div>
                            </button>

                            <button
                                onClick={() => setIsJoiningAgency(true)}
                                className="aspect-[16/9] p-5 border border-dashed border-(--border-subtle) bg-(--background-subtle/30) rounded-xl hover:bg-(--background-subtle) hover:border-(--border-surface-hover) cursor-pointer flex flex-col items-center justify-center gap-3 transition-all group"
                            >
                                <div className="w-10 h-10 rounded-full bg-(--foreground) text-(--background) flex items-center justify-center transition-transform group-hover:scale-110">
                                    <span className="text-xl font-bold">#</span>
                                </div>
                                <div className="text-center">
                                    <span className="block text-sm font-semibold text-(--foreground)">
                                        코드로 참여하기
                                    </span>
                                    <span className="block text-xs text-(--foreground-muted) mt-1">
                                        초대 코드를 입력하세요
                                    </span>
                                </div>
                            </button>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
