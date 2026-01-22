"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import ThemeHook from "@/hooks/ThemeHook";
import clsx from "clsx";
import IconWrapper from "@/components/ui/IconWrapper";
import Input from "@/components/ui/Input";

interface ListingGroup {
    address: string;
    count: number;
    name: string;
    latest_status: string;
}

interface ListingGroupListProps {
    groups: ListingGroup[];
    selectedAddress: string | null;
    onSelect: (address: string | null) => void;
    isLoading?: boolean;
}

export default function ListingGroupList({
    groups,
    selectedAddress,
    onSelect,
    isLoading,
    onAddNew,
}: ListingGroupListProps & { onAddNew: () => void }) {
    const { systemTheme } = ThemeHook();
    const [searchQuery, setSearchQuery] = useState("");

    const filteredGroups = useMemo(() => {
        if (!searchQuery) return groups;
        const lowerQuery = searchQuery.toLowerCase();
        return groups.filter(
            (g) =>
                g.address.toLowerCase().includes(lowerQuery) ||
                g.name.toLowerCase().includes(lowerQuery)
        );
    }, [groups, searchQuery]);

    return (
        <div className="flex flex-col h-full border border-(--border-surface) rounded-md bg-(--background)">
            {/* Header / Search */}
            <div className="p-2 border-b border-(--border-surface) space-y-2">
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-sm text-(--foreground)">
                        건물/주소 목록
                    </h2>
                    <IconWrapper
                        className="border border-(--border-surface)"
                        src={`/icons/add_listing/${systemTheme}.svg`}
                        onClick={onAddNew}
                        isVisibleDescription={true}
                        description="건물 추가"
                        alt="add"
                    />
                </div>
                <Input
                    className="w-full text-xs"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={"주소 또는 건물명 검색"}
                />
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
                {filteredGroups.length === 0 ? (
                    <div className="p-4 text-center text-xs text-(--foreground-muted) flex justify-center">
                        {searchQuery ? (
                            "검색 결과가 없습니다."
                        ) : (
                            "등록된 매물이 없습니다."
                        )}
                    </div>
                ) : (
                    <div className="divide-y divide-(--border-surface)">
                        {filteredGroups.map((group) => (
                            <div
                                key={group.address}
                                onClick={() => {
                                    if (selectedAddress === group.address) {
                                        onSelect(null);
                                    } else {
                                        onSelect(group.address);
                                    }
                                }}
                                className={clsx(
                                    "w-full text-left p-2 transition-colors flex flex-col gap-1 h-auto rounded-none items-start hover:bg-(--background-surface)",
                                    selectedAddress === group.address
                                        ? "bg-(--background) border-l-2 border-l-(--primary) bg-(--background-surface)"
                                        : "border-l-2 border-l-transparent"
                                )}
                            >
                                <div className="flex justify-between items-start w-full">
                                    <span className="font-medium text-sm text-(--foreground) truncate pr-2">
                                        {group.name || "건물명 없음"}
                                    </span>
                                    <div className="flex justify-center items-center text-[10px] w-[24px] h-[24px] px-1.5 p-2 rounded-full border border-(--border) text-(--foreground-muted) shrink-0">
                                        {group.count}
                                    </div>
                                </div>
                                <span className="text-xs text-(--foreground-muted) truncate w-full text-left">
                                    {group.address}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
