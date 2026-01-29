import React from "react";
import IconWrapper from "@/components/ui/IconWrapper";
import { Check, RotateCcw } from "lucide-react";
import ThemeHook from "@/hooks/ThemeHook";
import clsx from "clsx";
import Image from "next/image";
import Input from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface LeadsToolbarProps {
    onOpenAddPanel: () => void;
    onToggleColumnPopup: () => void;
    isSearchFilterOpen: boolean;
    onToggleSearchFilter: () => void;
    searchColumns: Record<string, boolean>;
    onToggleSearchColumn: (key: string) => void;
    searchQuery: string;
    onSearchQueryChange: (val: string) => void;
    onSearchSubmit: () => void;
    getSearchLabel: (key: string) => string;
    onResetSort?: () => void;
}

export default function LeadsToolbar({
    onOpenAddPanel,
    onToggleColumnPopup,
    isSearchFilterOpen,
    onToggleSearchFilter,
    searchColumns,
    onToggleSearchColumn,
    searchQuery,
    onSearchQueryChange,
    onSearchSubmit,
    getSearchLabel,
    onResetSort,
}: LeadsToolbarProps) {
    const { systemTheme } = ThemeHook();

    return (
        <div className="flex flex-col md:flex-row mb-2 gap-2">
            <div className="flex gap-2 justify-between md:justify-start w-full md:w-auto">
                <div className="flex gap-2">
                    <IconWrapper
                        className="border border-(--border-surface)"
                        src={`/icons/add/${systemTheme}.svg`}
                        alt="add"
                        isVisibleDescription={true}
                        description="리드 추가"
                        onClick={onOpenAddPanel}
                    />
                        <IconWrapper
                            className="border border-(--border-surface)"
                            src={`/icons/visible/${systemTheme}.svg`}
                            alt="filter"
                            isVisibleDescription={true}
                            description="컬럼 표시"
                            onClick={onToggleColumnPopup}
                        />
                </div>
            </div>
            
            <div className="flex gap-2 w-full md:w-auto md:flex-1 md:justify-end items-center relative">
                 <div className="relative">
                    <IconWrapper
                        className="border border-(--border-surface)"
                        src={`/icons/filter/${systemTheme}.svg`}
                        alt="search-filter"
                        isVisibleDescription={true}
                        description="검색 조건"
                        onClick={onToggleSearchFilter}
                    />
                    {isSearchFilterOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-(--z-dropdown-backdrop)"
                                onClick={onToggleSearchFilter}
                            />
                            <div className="absolute top-full left-0 mt-2 w-40 bg-(--background) border border-(--border) z-(--z-dropdown) p-1 flex flex-col gap-1">
                                <div className="text-(--foreground-muted)  border-b border-(--border) text-xs py-2 px-1">
                                    검색 조건
                                </div>
                                {Object.keys(searchColumns).map((key) => (
                                    <div
                                        key={key}
                                        className="flex items-center gap-2 px-2 py-1.5 hover:bg-(--accent) rounded cursor-pointer transition-colors"
                                        onClick={() =>
                                            onToggleSearchColumn(key)
                                        }
                                    >
                                        <Image
                                            width={16}
                                            height={16}
                                            src={`/icons/${
                                                searchColumns[key]
                                                    ? "checkbox"
                                                    : "uncheck"
                                            }/${systemTheme}.svg`}
                                            alt="check"
                                        />
                                        <span className="text-xs">
                                            {getSearchLabel(key)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
                <div className="flex gap-2 h-[36px] flex-1 md:flex-none">
                    <div className="flex-1 md:w-60 h-full">
                        <Input
                            className="w-full h-full text-xs"
                            value={searchQuery}
                            onChange={(e) => onSearchQueryChange(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === "Enter" && onSearchSubmit()
                            }
                            placeholder="리드 내 검색"
                        />
                    </div>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={onSearchSubmit}
                        className="h-full px-4 text-xs whitespace-nowrap"
                    >
                        검색
                    </Button>
                </div>
            </div>
        </div>
    );
}
