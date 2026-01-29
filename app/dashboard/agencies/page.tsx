"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ThemeHook from "@/hooks/ThemeHook";
import { Button } from "@/components/ui/Button";

import { Agency } from "@/types/agency";
import Input from "@/components/ui/Input";
import GlobalLoader from "@/components/ui/GlobalLoader";

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
                .select("agency_id, role")
                .eq("user_id", publicUserId)
                .eq("status", "ACTIVE");

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
                };
            }) as Agency[];
        },
    });

    const [isNavigating, setIsNavigating] = useState(false);

    // Creation State
    const [isCreatingAgency, setIsCreatingAgency] = useState(false);
    const [newAgencyName, setNewAgencyName] = useState("");
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

    return (
        <div className="fixed inset-0 z-50 bg-(--background) flex flex-col items-center justify-center p-6">
            {(isLoading || isNavigating || isCreating) && <GlobalLoader />}
            <div className="w-full max-w-2xl">
                <div className="mb-6 text-center">
                    <h1 className="text-xl font-bold mb-1 text-(--foreground)">
                        에이전시 선택
                    </h1>
                    <p className="text-sm text-(--foreground-muted)">
                        관리할 에이전시를 선택하거나 새로 만드세요.
                    </p>
                </div>

                {isCreatingAgency ? (
                    <div className="flex flex-col w-full max-w-md mx-auto bg-(--background) p-4 border border-(--border) space-y-3">
                        <h3 className="text-sm font-semibold text-(--foreground)">
                            새 에이전시 정보
                        </h3>
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
                        <div className="flex gap-2 justify-end h-[36px]">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsCreatingAgency(false)}
                            >
                                취소
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCreateAgency}
                                disabled={isCreating || !newAgencyName.trim()}
                            >
                                {isCreating ? "생성 중..." : "생성하기"}
                            </Button>
                        </div>
                    </div>
                ) : (
                    !isLoading && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {agencies?.map((agency) => (
                                <div
                                    key={agency.id}
                                    className="aspect-video p-4 border border-(--border-subtle) hover:bg-(--background-subtle-hover) cursor-pointer flex flex-col justify-between transition-all bg-(--background-subtle) group"
                                    onClick={() => handleSelect(agency.id)}
                                >
                                    <div className="flex flex-col gap-2 items-start w-full">
                                        <h3 className="font-semibold text-(--foreground) truncate w-full">
                                            {agency.name}
                                        </h3>
                                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-(--background-subtle) text-(--foreground-muted) border border-(--border-subtle) shrink-0">
                                            {agency.role === "OWNER"
                                                ? "소유자"
                                                : "멤버"}
                                        </span>
                                    </div>
                                    <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Image
                                            src={`/icons/chevron/dark.svg`}
                                            width={16}
                                            height={16}
                                            alt="Go"
                                            className="-rotate-90 opacity-50"
                                        />
                                    </div>
                                </div>
                            ))}

                            <button
                                onClick={() => setIsCreatingAgency(true)}
                                className="aspect-video p-4 border border-dashed border-(--border-surface) hover:bg-(--background-surface-hover) cursor-pointer flex flex-col items-center justify-center gap-2 transition-all bg-(--background-surface)"
                            >
                                <span className="text-2xl text-(--foreground-muted)">
                                    +
                                </span>
                                <span className="text-xs text-(--foreground-muted) font-medium">
                                    새 에이전시 추가
                                </span>
                            </button>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
