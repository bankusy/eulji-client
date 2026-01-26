"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, Phone, Clock } from "lucide-react";

interface RecentLeadsProps {
    recentLeads: {
        id: string;
        name: string;
        stage: string;
        created_at: string;
        phone: string;
    }[];
    agencyId: string;
}


export default function RecentLeads({ recentLeads, agencyId }: RecentLeadsProps) {
    const stageMap: Record<string, string> = {
        NEW: "신규",
        IN_PROGRESS: "진행 중",
        RESERVED: "예약",
        CONTRACTED: "계약 완료",
        CANCELED: "계약 취소",
        FAILED: "계약 실패",
    };

    return (
        <div className="rounded-xl border border-(--border-surface) bg-(--background-surface) p-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="font-semibold text-(--foreground)">최근 등록된 리드</h3>
                    <p className="text-sm text-(--foreground-muted)">
                        가장 최근에 추가된 5명의 고객입니다.
                    </p>
                </div>
                <Link
                    href={`/dashboard/agencies/${agencyId}/leads`}
                    className="text-sm font-medium text-(--primary) hover:underline flex items-center gap-1"
                >
                    전체 보기 <ArrowUpRight className="h-4 w-4" />
                </Link>
            </div>
            
            <div className="space-y-4">
                {recentLeads.length > 0 ? (
                    recentLeads.map((lead) => (
                        <div
                            key={lead.id}
                            className="flex items-center justify-between p-4 border border-(--border) rounded-lg bg-(--background) hover:bg-(--background-surface) transition-colors"
                        >
                            <div className="flex flex-col gap-1">
                                <div className="font-medium text-sm flex items-center gap-2">
                                    {lead.name}
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-(--primary)/10 text-(--primary) border border-(--primary)/20">
                                        {stageMap[lead.stage] || lead.stage}
                                    </span>
                                </div>
                                <div className="text-xs text-(--foreground-muted) flex items-center gap-2">
                                    <span className="flex items-center gap-1">
                                        <Phone size={10} /> 
                                        {lead.phone?.replace(/^(\d{2,3})(\d{3,4})(\d{4})$/, "$1-$2-$3")}
                                    </span>
                                </div>
                            </div>
                            <div className="text-xs text-(--foreground-muted) flex items-center gap-1">
                                <Clock size={12} />
                                {new Date(lead.created_at).toLocaleDateString("ko-KR")}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-(--foreground-muted) text-sm border border-dashed border-(--border) rounded-lg">
                        아직 등록된 리드가 없습니다.
                    </div>
                )}
            </div>
        </div>
    );
}
