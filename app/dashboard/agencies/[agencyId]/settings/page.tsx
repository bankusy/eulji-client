"use client";

import { useState, useEffect } from "react";
import ThemeHook from "@/hooks/ThemeHook";
import clsx from "clsx";
import { Button } from "@/components/ui/Button";
import { useParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Agency } from "@/types/agency";
import { refreshInviteCode } from "./actions";
import { RefreshCw, Copy } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useUserStore } from "@/hooks/useUserStore";
import Input from "@/components/ui/Input";

type TabType = "profile" | "agency";

export default function SettingsPage() {
    const { systemTheme } = ThemeHook();
    const params = useParams();
    const agencyId = params.agencyId as string;
    const { user } = useUserStore();

    const [activeTab, setActiveTab] = useState<TabType>("profile");
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    // Agency form state
    const [agencyName, setAgencyName] = useState("");
    const [licenseNo, setLicenseNo] = useState("");
    const [domain, setDomain] = useState("");
    const [domainError, setDomainError] = useState("");
    const [isDomainChecking, setIsDomainChecking] = useState(false);
    const [agencyKakaoUrl, setAgencyKakaoUrl] = useState("");

    // User form state
    const [userKakaoUrl, setUserKakaoUrl] = useState("");

    // Fetch agency info
    const { data: agency, refetch: refetchAgency } = useQuery({
        queryKey: ["agency", agencyId],
        queryFn: async () => {
            if (!agencyId) return null;
            const supabase = createSupabaseBrowserClient();
            const { data } = await supabase
                .from("agencies")
                .select("*")
                .eq("id", agencyId)
                .single();
            return data as Agency | null;
        },
        enabled: !!agencyId,
    });

    // Initialize form values when agency data loads
    useEffect(() => {
        if (agency) {
            setAgencyName(agency.name || "");
            setLicenseNo(agency.license_no || "");
            setDomain(agency.domain || "");
            setAgencyKakaoUrl(agency.kakao_url || "");
        }
    }, [agency]);

    // Initialize user form values
    useEffect(() => {
        if (user) {
            setUserKakaoUrl(user.kakao_url || "");
        }
    }, [user]);

    // Fetch user role
    const { data: agencyInfo } = useQuery({
        queryKey: ["agencyInfo", agencyId, user?.id],
        queryFn: async () => {
            if (!agencyId || !user?.id) return null;
            const supabase = createSupabaseBrowserClient();
            const { data: membership } = await supabase
                .from("agency_users")
                .select("role")
                .eq("agency_id", agencyId)
                .eq("user_id", user.id)
                .single();
            return { role: membership?.role };
        },
        enabled: !!agencyId && !!user?.id,
    });

    const isOwner = agencyInfo?.role === "OWNER";

    const handleRefreshCode = async () => {
        if (!agencyId || !confirm("초대 코드를 재설정하시겠습니까? 기존 코드는 즉시 무효화됩니다.")) return;
        
        setIsRefreshing(true);
        try {
            const result = await refreshInviteCode(agencyId);
            if (result.success) {
                refetchAgency();
                alert("초대 코드가 재설정되었습니다.");
            }
        } catch (error) {
            console.error(error);
            alert("초대 코드 재설정에 실패했습니다.");
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleCopyCode = () => {
        if (agency?.invite_code) {
            navigator.clipboard.writeText(agency.invite_code);
            alert("초대 코드가 복사되었습니다.");
        }
    };

    // 도메인 중복 체크
    const checkDomainAvailability = async (domainValue: string) => {
        if (!domainValue) {
            setDomainError("");
            return true;
        }

        // 도메인 형식 검증 (영문자, 숫자, 하이픈만 허용)
        const domainRegex = /^[a-z0-9-]+$/;
        if (!domainRegex.test(domainValue)) {
            setDomainError("도메인은 영문 소문자, 숫자, 하이픈(-)'만 사용할 수 있습니다.");
            return false;
        }

        setIsDomainChecking(true);
        setDomainError("");

        try {
            const supabase = createSupabaseBrowserClient();
            const { data: existingAgency } = await supabase
                .from("agencies")
                .select("id")
                .eq("domain", domainValue)
                .neq("id", agencyId)
                .single();

            if (existingAgency) {
                setDomainError("이미 사용 중인 도메인입니다.");
                return false;
            }

            return true;
        } catch (error) {
            // .single() returns error if no match found, which is what we want
            return true;
        } finally {
            setIsDomainChecking(false);
        }
    };

    // 도메인 입력 시 디바운스 체크
    useEffect(() => {
        if (domain === agency?.domain) {
            setDomainError("");
            return;
        }

        const timer = setTimeout(() => {
            if (domain) {
                checkDomainAvailability(domain);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [domain, agency?.domain, agencyId]);

    const handleSaveProfile = async () => {
        if (!user) return;

        setIsSaving(true);
        try {
            const supabase = createSupabaseBrowserClient();
            // User Table 업데이트 (kakao_url 등)
            // 주의: users 테이블 권한 정책 확인 필요. 본인 정보 수정 가능해야 함.
            const { error } = await supabase
                .from("users")
                .update({ kakao_url: userKakaoUrl })
                .eq("id", user.id);

            if (error) throw error;
            
            // 이름/소개 등은 user_metadata로 관리되는지 public.users 컬럼인지에 따라 다름.
            // 현재 코드 흐름상 public.users 컬럼이라면 여기서 같이 업데이트.
            // 만약 auth.users 메타데이터라면 supabase.auth.updateUser() 사용.
            // 여기서는 kakao_url만 처리하고 나머지는 기존 로직(있다면) 유지.
            
            alert("프로필이 저장되었습니다.");
        } catch (error) {
            console.error(error);
            alert("프로필 저장에 실패했습니다.");
        } finally {
            setIsSaving(false);
        }
    };

    // 에이전시 정보 저장
    const handleSaveAgency = async () => {
        if (!agencyId || !isOwner) return;

        // 도메인 최종 검증
        if (domain && domain !== agency?.domain) {
            const isAvailable = await checkDomainAvailability(domain);
            if (!isAvailable) {
                return;
            }
        }

        setIsSaving(true);
        try {
            const supabase = createSupabaseBrowserClient();
            const { error } = await supabase
                .from("agencies")
                .update({
                    name: agencyName,
                    license_no: licenseNo,
                    domain: domain || null,
                    kakao_url: agencyKakaoUrl || null,
                })
                .eq("id", agencyId);

            if (error) throw error;

            await refetchAgency();
            alert("저장되었습니다.");
        } catch (error) {
            console.error(error);
            alert("저장에 실패했습니다.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col overflow-hidden bg-(--background)">
            {/* Tabs */}
            <div className="flex gap-6 px-6 border-b border-(--border-surface) bg-(--background)">
                <button
                    onClick={() => setActiveTab("profile")}
                    className={clsx(
                        "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                        activeTab === "profile"
                            ? "border-(--primary) text-(--primary)"
                            : "border-transparent text-(--foreground-muted) hover:text-(--foreground)"
                    )}
                >
                    내 설정
                </button>
                {isOwner && (
                    <button
                        onClick={() => setActiveTab("agency")}
                        className={clsx(
                            "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                            activeTab === "agency"
                                ? "border-(--primary) text-(--primary)"
                                : "border-transparent text-(--foreground-muted) hover:text-(--foreground)"
                        )}
                    >
                        에이전시 설정
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6">
                <div className="max-w-xl mx-auto space-y-6">
                    {activeTab === "profile" && (
                        <>
                            {/* 프로필 정보 */}
                            <div className="rounded-xl border border-(--border-surface) bg-(--background-surface) p-6 shadow-sm">
                                <h3 className="font-semibold text-(--foreground) mb-4">프로필 정보</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-(--foreground) mb-1">
                                            이름
                                        </label>
                                        <Input
                                            defaultValue={user?.nickname || user?.name || ""}
                                            placeholder="이름을 입력하세요"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-(--foreground) mb-1">
                                            이메일
                                        </label>
                                        <Input
                                            defaultValue={user?.email || ""}
                                            disabled
                                            className="bg-(--background-subtle)"
                                        />
                                        <p className="text-xs text-(--foreground-muted) mt-1">
                                            이메일은 변경할 수 없습니다.
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-(--foreground) mb-1">
                                            소개
                                        </label>
                                        <input
                                            defaultValue={user?.introduction || ""}
                                            placeholder="자기소개를 입력하세요"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-(--foreground) mb-1">
                                            카카오톡 오픈채팅방 링크
                                        </label>
                                        <Input
                                            value={userKakaoUrl}
                                            onChange={(e) => setUserKakaoUrl(e.target.value)}
                                            placeholder="https://open.kakao.com/o/..."
                                        />
                                        <p className="text-xs text-(--foreground-muted) mt-1">
                                            문의 고객에게 '카카오톡 상담하기' 버튼 클릭 시 연결될 URL입니다.
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end">
                                    <Button variant="primary" onClick={handleSaveProfile} disabled={isSaving}>
                                        {isSaving ? "저장 중..." : "저장하기"}
                                    </Button>
                                </div>
                            </div>

                            {/* 개인 문의 폼 링크 */}
                            <div className="rounded-xl border border-(--border-surface) bg-(--background-surface) p-6 shadow-sm">
                                <h3 className="font-semibold text-(--foreground) mb-4">나의 문의 폼 링크</h3>
                                <p className="text-sm text-(--foreground-muted) mb-4">
                                    이 링크를 블로그, SNS, 명함 등에 공유하면 문의가 자동으로 나에게 배정됩니다.
                                </p>
                                <div className="bg-(--background-subtle) p-4 rounded-lg border border-(--border-subtle)">
                                    <label className="text-xs font-medium text-(--foreground-muted) mb-2 block">
                                        내 문의 폼 URL
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <code className="flex-1 bg-(--background) px-4 py-3 rounded-lg border border-(--border) text-sm font-mono break-all text-(--foreground)">
                                            {typeof window !== 'undefined' 
                                                ? `${window.location.origin}/contact/${agencyId}/${user?.id}`
                                                : `https://your-domain.com/contact/${agencyId}/${user?.id}`
                                            }
                                        </code>
                                        <Button 
                                            variant="outline" 
                                            onClick={() => {
                                                if (user?.id) {
                                                    const url = `${window.location.origin}/contact/${agencyId}/${user.id}`;
                                                    navigator.clipboard.writeText(url);
                                                    alert("링크가 복사되었습니다!");
                                                }
                                            }}
                                        >
                                            <Copy className="w-4 h-4 mr-2" />
                                            복사
                                        </Button>
                                    </div>
                                    <p className="text-xs text-(--foreground-muted) mt-3">
                                        💡 이 링크로 접수된 문의는 자동으로 나에게 배정되며, 내 카카오톡으로 연결됩니다.
                                    </p>
                                </div>
                            </div>

                            {/* 알림 설정 */}
                            <div className="rounded-xl border border-(--border-surface) bg-(--background-surface) p-6 shadow-sm">
                                <h3 className="font-semibold text-(--foreground) mb-4">알림 설정</h3>
                                <div className="text-center py-12 text-(--foreground-muted)">
                                    준비 중인 기능입니다.
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === "agency" && isOwner && (
                        <>
                            {/* 에이전시 정보 */}
                            <div className="rounded-xl border border-(--border-surface) bg-(--background-surface) p-6 shadow-sm">
                                <h3 className="font-semibold text-(--foreground) mb-4">에이전시 정보</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-(--foreground) mb-1">
                                            에이전시 이름
                                        </label>
                                        <Input
                                            value={agencyName}
                                            onChange={(e) => setAgencyName(e.target.value)}
                                            placeholder="에이전시 이름을 입력하세요"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-(--foreground) mb-1">
                                            사업자등록번호
                                        </label>
                                        <Input
                                            value={licenseNo}
                                            onChange={(e) => setLicenseNo(e.target.value)}
                                            placeholder="000-00-00000"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-(--foreground) mb-1">
                                            도메인
                                        </label>
                                        <div className="relative">
                                            <Input
                                                value={domain}
                                                onChange={(e) => setDomain(e.target.value.toLowerCase())}
                                                placeholder="myagency"
                                                className={clsx(
                                                    domainError && "border-red-500 focus:border-red-500"
                                                )}
                                            />
                                            {isDomainChecking && (
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                    <div className="w-4 h-4 border-2 border-(--primary) border-t-transparent rounded-full animate-spin" />
                                                </div>
                                            )}
                                        </div>
                                        {domainError ? (
                                            <p className="text-xs text-red-500 mt-1">{domainError}</p>
                                        ) : (
                                            <p className="text-xs text-(--foreground-muted) mt-1">
                                                프로필에서 @{domain || "도메인"}으로 표시됩니다. (영문 소문자, 숫자, 하이픈만 가능)
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-(--foreground) mb-1">
                                            에이전시 대표 카카오톡 링크
                                        </label>
                                        <Input
                                            value={agencyKakaoUrl}
                                            onChange={(e) => setAgencyKakaoUrl(e.target.value)}
                                            placeholder="https://open.kakao.com/o/..."
                                        />
                                        <p className="text-xs text-(--foreground-muted) mt-1">
                                            담당자가 배정되지 않은 리드에게 보여질 기본 상담 링크입니다.
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end">
                                    <Button 
                                        variant="primary" 
                                        onClick={handleSaveAgency}
                                        disabled={isSaving || isDomainChecking || !!domainError}
                                    >
                                        {isSaving ? "저장 중..." : "저장하기"}
                                    </Button>
                                </div>
                            </div>

                            {/* 팀원 초대 */}
                            <div className="rounded-xl border border-(--border-surface) bg-(--background-surface) p-6 shadow-sm">
                                <h3 className="font-semibold text-(--foreground) mb-4">팀원 초대</h3>
                                <div className="bg-(--background-subtle) p-4 rounded-lg border border-(--border-subtle)">
                                    <label className="text-xs font-medium text-(--foreground-muted) mb-2 block">
                                        초대 코드
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <code className="flex-1 bg-(--background) px-4 py-3 rounded-lg border border-(--border) text-lg font-mono tracking-wider font-bold text-(--foreground)">
                                            {agency?.invite_code || "코드 없음"}
                                        </code>
                                        <Button 
                                            variant="outline" 
                                            onClick={handleCopyCode}
                                            disabled={!agency?.invite_code}
                                        >
                                            <Copy className="w-4 h-4 mr-2" />
                                            복사
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            onClick={handleRefreshCode}
                                            disabled={isRefreshing}
                                            className="text-red-500 hover:text-red-600"
                                        >
                                            <RefreshCw className={clsx("w-4 h-4 mr-2", isRefreshing && "animate-spin")} />
                                            재설정
                                        </Button>
                                    </div>
                                    <p className="text-xs text-(--foreground-muted) mt-3">
                                        이 코드를 가진 사용자는 에이전시에 '멤버' 권한으로 가입할 수 있습니다.
                                        <br />
                                        코드가 유출된 경우 '재설정'을 통해 기존 코드를 무효화하세요.
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
