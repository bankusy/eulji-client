"use client";

import { CreditCard, TrendingUp, UserPlus, Users } from "lucide-react";
import React from "react";

interface StatsCardsProps {
    counts: {
        total: number;
        newToday: number;
        active: number;
        success: number;
    };
}

export default function StatsCards({ counts }: StatsCardsProps) {
    const cards = [
        {
            label: "전체 리드",
            value: counts.total,
            icon: Users,
            description: "누적 등록된 리드 수",
        },
        {
            label: "오늘 신규",
            value: counts.newToday,
            icon: UserPlus,
            description: "오늘 들어온 새로운 리드",
            highlight: counts.newToday > 0, // Highlight if positive
        },
        {
            label: "진행 중 (Active)",
            value: counts.active,
            icon: TrendingUp,
            description: "상담 및 계약 진행 중",
        },
        {
            label: "계약 완료",
            value: counts.success,
            icon: CreditCard,
            description: "성사된 거래 건수",
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {cards.map((card, index) => (
                <div
                    key={index}
                    className="p-6 rounded-xl border border-(--border-surface) bg-(--background-surface)"
                >
                    <div className="flex items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium text-(--foreground-muted)">
                            {card.label}
                        </h3>
                        <card.icon className={`h-4 w-4 ${card.highlight ? "text-(--primary)" : "text-(--foreground-muted)"}`} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className={`text-2xl font-bold ${card.highlight ? "text-(--primary)" : "text-(--foreground)"}`}>
                            {card.value.toLocaleString()}
                        </div>
                        <p className="text-xs text-(--foreground-muted)">
                            {card.description}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
