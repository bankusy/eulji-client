"use client";

import { useState, useEffect } from "react";
import ThemeHook from "@/hooks/ThemeHook";
import clsx from "clsx";
import { Button } from "@/components/ui/Button";
import { FormSection, FormRow, FormInput } from "@/components/ui/dashboard/Form";
import { useParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Agency } from "@/types/agency";

import { refreshInviteCode } from "./actions";
import { RefreshCw } from "lucide-react";

export default function SettingsPage() {
    const { systemTheme } = ThemeHook();
    const params = useParams();
    const agencyId = params.agencyId as string;

    const [loading, setLoading] = useState(true);
    const [agency, setAgency] = useState<Agency | null>(null);
    const [activeTab, setActiveTab] = useState<"general" | "notifications" | "team">("general");
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        const fetchAgency = async () => {
            if (!agencyId) return;
            const supabase = createSupabaseBrowserClient();
            
            // 1. Verify access via RLS/Policy or just fetch if allowed
            // Ideally we have an API or RLS. For now, client-side fetch.
            const { data, error } = await supabase
                .from("agencies")
                .select("*")
                .eq("id", agencyId)
                .single();

            if (data) {
                setAgency(data as Agency);
            }
            setLoading(false);
        };
        fetchAgency();
    }, [agencyId]);

    const handleRefreshCode = async () => {
        if (!agencyId || !confirm("초대 코드를 재설정하시겠습니까? 기존 코드는 즉시 무효화됩니다.")) return;
        
        setIsRefreshing(true);
        try {
            const result = await refreshInviteCode(agencyId);
            if (result.success && result.newCode) {
                setAgency(prev => prev ? { ...prev, invite_code: result.newCode } : null);
                alert("초대 코드가 재설정되었습니다.");
            }
        } catch (error) {
            console.error(error);
            alert("초대 코드 재설정에 실패했습니다.");
        } finally {
            setIsRefreshing(false);
        }
    };

    const tabs = [
        { id: "general", label: "일반" },
        { id: "notifications", label: "알림" },
        { id: "team", label: "팀 & 멤버" },
    ];

    if (loading) return <div className="p-8">Loading...</div>;
    if (!agency) return <div className="p-8">Agency not found</div>;

    return (
        <div className="flex w-full h-full overflow-hidden bg-(--background)">
            {/* Secondary Sidebar */}
            <div className="w-[240px] shrink-0 border-r border-(--border) flex flex-col bg-(--background)">
                <div className="p-4 border-b border-(--border)">
                    <h2 className="font-bold text-lg text-(--foreground)">설정</h2>
                </div>
                <nav className="flex-1 p-2 space-y-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={clsx(
                                "w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                activeTab === tab.id
                                    ? "bg-(--background) text-(--foreground) shadow-sm border border-(--border)"
                                    : "text-(--foreground-muted) hover:bg-(--background) hover:text-(--foreground)"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-auto bg-(--background)">
                <div className="max-w-5xl mx-auto p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-(--foreground)">
                            {tabs.find(t => t.id === activeTab)?.label}
                        </h1>
                        <p className="text-(--foreground-muted) mt-1">
                            {activeTab === "general" && "에이전시 기본 정보를 관리합니다."}
                            {activeTab === "notifications" && "알림 수신 설정을 변경합니다."}
                            {activeTab === "team" && "팀원을 초대하고 권한을 관리합니다."}
                        </p>
                    </div>

                    {/* Content */}
                    <div className="space-y-8">
                        {activeTab === "general" && (
                            <>
                                <FormSection title="에이전시 정보">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-20 h-20 rounded-lg bg-(--border) flex items-center justify-center text-(--foreground-muted) border border-(--border)">
                                                Logo
                                            </div>
                                            <div>
                                                <Button variant="outline" size="sm">로고 변경</Button>
                                                <p className="text-xs text-(--foreground-muted) mt-1">권장 사이즈: 200x200px</p>
                                            </div>
                                        </div>

                                        <FormRow>
                                            <FormInput label="에이전시 이름" placeholder="우정공인중개사" defaultValue={agency.name} />
                                            <FormInput label="대표자명" placeholder="홍길동" defaultValue="" />
                                        </FormRow>
                                        <FormInput label="사업자등록번호" placeholder="000-00-00000" defaultValue={agency.license_no || ""} />
                                        <FormInput label="대표 전화번호"  placeholder="02-0000-0000" />
                                        <FormInput label="주소" placeholder="서울시..." />
                                    </div>
                                    <div className="mt-4 flex justify-end">
                                        <Button>저장하기</Button>
                                    </div>
                                </FormSection>

                                <FormSection title="기본 설정">
                                    <div className="flex items-center justify-between py-4 border-b border-(--border)">
                                        <div>
                                            <h4 className="text-sm font-medium text-(--foreground)">다크 모드 강제 적용</h4>
                                            <p className="text-xs text-(--foreground-muted)">시스템 설정과 관계없이 다크모드를 사용합니다.</p>
                                        </div>
                                        {/* Simple Toggle Mock */}
                                        <div className="w-10 h-6 bg-(--border) rounded-full relative cursor-pointer">
                                            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                                        </div>
                                    </div>
                                </FormSection>
                            </>
                        )}

                        {activeTab === "notifications" && (
                            <div className="text-center py-20 text-(--foreground-muted)">
                                준비 중인 기능입니다.
                            </div>
                        )}

                        {activeTab === "team" && (
                            <FormSection title="팀원 초대">
                                <div className="space-y-4">
                                    <div className="bg-(--background-subtle) p-4 rounded-lg border border-(--border)">
                                        <label className="text-xs font-medium text-(--foreground-muted) mb-2 block">
                                            초대 코드 (이 코드를 공유하세요)
                                        </label>
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-2 flex-1">
                                                <code className="bg-(--background) px-3 py-2 rounded border border-(--border) text-lg font-mono tracking-wider font-bold">
                                                    {agency.invite_code || "코드 없음 (관리자 문의)"}
                                                </code>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={() => {
                                                        if (agency.invite_code) {
                                                            navigator.clipboard.writeText(agency.invite_code);
                                                            alert("복사되었습니다.");
                                                        }
                                                    }}
                                                >
                                                    복사
                                                </Button>
                                            </div>
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={handleRefreshCode}
                                                disabled={isRefreshing}
                                                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                                            >
                                                <RefreshCw className={clsx("w-4 h-4 mr-2")} />
                                                코드 재설정
                                            </Button>
                                        </div>
                                        <p className="text-xs text-(--foreground-muted) mt-2">
                                            이 코드를 가진 사용자는 에이전시에 '멤버' 권한으로 가입할 수 있습니다. 
                                            <br />
                                            코드가 유출된 경우 '코드 재설정'을 통해 기존 코드를 무효화하세요.
                                        </p>
                                    </div>
                                </div>
                            </FormSection>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
