import { Search, RotateCcw } from "lucide-react";
import React, { useState } from "react";
import IconWrapper from "@/components/ui/IconWrapper";
import { Check } from "lucide-react";
import ThemeHook from "@/hooks/ThemeHook";
import clsx from "clsx";
import Image from "next/image";
import { Button } from "../../Button";
import Input from "@/components/ui/Input";
import { InputGroup } from "@/components/ui/InputGroup";

interface ListingsToolbarProps {
    className?: string;
    onOpenAddPanel: () => void;
    onToggleColumnPopup: () => void;
    searchQuery: string;
    onSearch: (query: string) => void;
    placeholder?: string;
    onReset: () => void;
}

export default function ListingsToolbar({
    className,
    onOpenAddPanel,
    onToggleColumnPopup,
    searchQuery: externalSearchQuery,
    onSearch,
    placeholder = "검색어 입력",
    onReset,
}: ListingsToolbarProps) {
    const { systemTheme } = ThemeHook();
    const [searchQuery, setSearchQuery] = useState(externalSearchQuery);

    const onSearchQueryChange = (val: string) => {
        setSearchQuery(val);
        // Optional: debounce if needed, or just let parent handle submit
    };

    const onSearchSubmit = () => {
        onSearch(searchQuery);
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
                        width={14}
                        height={14}
                        src={`/icons/add/${systemTheme}.svg`}
                        isVisibleDescription={true}
                        description="매물 추가"
                        alt="add"
                        onClick={onOpenAddPanel}
                    />
                    <div className="relative">
                        <IconWrapper
                            width={14}
                            height={14}
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
            
            <div className="flex gap-2 w-full h-full md:w-auto ">
                <div className="flex-1 md:w-60 h-[36px]">
                    <Input
                        className="w-full h-full text-xs"
                        value={searchQuery}
                        onChange={(e) => onSearchQueryChange(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && onSearchSubmit()}
                        placeholder="매물 내 검색"
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
    );
}
