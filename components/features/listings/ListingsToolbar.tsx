import { Search, RotateCcw } from "lucide-react";
import React, { useState } from "react";
import IconWrapper from "@/components/ui/IconWrapper";
import { Check } from "lucide-react";
import ThemeHook from "@/hooks/ThemeHook";
import clsx from "clsx";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";


interface ListingsToolbarProps {
    className?: string;
    onOpenAddPanel: () => void;
    onToggleColumnPopup: () => void;
    isSearchFilterOpen: boolean;
    onToggleSearchFilter: () => void;
    searchColumns: Record<string, boolean>;
    onToggleSearchColumn: (key: string) => void;
    searchQuery: string;
    onSearch: (query: string) => void;
    onSearchSubmit: () => void;
    getSearchLabel: (key: string) => string;
    placeholder?: string;
    onReset: () => void;
}

export default function ListingsToolbar({
    className,
    onOpenAddPanel,
    onToggleColumnPopup,
    isSearchFilterOpen,
    onToggleSearchFilter,
    searchColumns,
    onToggleSearchColumn,
    searchQuery: externalSearchQuery,
    onSearch,
    onSearchSubmit,
    getSearchLabel,
    placeholder = "검색어 입력",
    onReset,
}: ListingsToolbarProps) {
    const { systemTheme } = ThemeHook();
    const [searchQuery, setSearchQuery] = useState(externalSearchQuery);

    const onSearchQueryChange = (val: string) => {
        setSearchQuery(val);
        onSearch(val);
    };

    const handleSearchSubmit = () => {
        onSearchSubmit();
    };

    return (
        <div
            className={clsx(
                `flex flex-col md:flex-row justify-between items-start md:items-center bg-(--background) w-full gap-2`,
                className,
            )}
        >
            <div className="flex gap-2 items-center w-full md:w-auto justify-between md:justify-start">
                <div className="flex gap-2 items-center">
                    <IconWrapper
                        className="border border-(--border-surface)"
                        width={16}
                        height={16}
                        src={`/icons/add/${systemTheme}.svg`}
                        isVisibleDescription={true}
                        description="매물 추가"
                        alt="add"
                        onClick={onOpenAddPanel}
                    />
                    <div className="relative">
                        <IconWrapper
                            width={16}
                            height={16}
                            className="border border-(--border-surface)"
                            src={`/icons/visible/${systemTheme}.svg`}
                            isVisibleDescription={true}
                            description="컬럼 표시"
                            alt="filter"
                            onClick={onToggleColumnPopup}
                        />
                    </div>
                </div>
            </div>
            
            <div className="flex gap-2 w-full h-full md:w-auto md:flex-1 md:justify-end items-center relative">
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
                            <div className="absolute top-full left-0 mt-2 w-40 bg-(--background) border border-(--border) rounded-md shadow-lg z-(--z-dropdown) p-1 flex flex-col gap-1">
                                <div className="text-(--foreground-muted) border-b border-(--border) text-xs py-2 px-1">
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
                            onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
                            placeholder="매물 내 검색"
                        />
                    </div>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleSearchSubmit}
                        className="h-full px-4 text-xs whitespace-nowrap"
                    >
                        검색
                    </Button>
                </div>
            </div>
        </div>
    );
}
