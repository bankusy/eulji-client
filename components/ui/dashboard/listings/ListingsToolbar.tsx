import { Search, RotateCcw } from "lucide-react";
import React, { useState } from "react";
import IconWrapper from "@/components/ui/IconWrapper";
import { Check } from "lucide-react";
import ThemeHook from "@/hooks/ThemeHook";
import clsx from "clsx";
import Image from "next/image";
import { Button } from "../../Button";
import Input from "@/components/Input";
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
                `flex justify-between items-center bg-(--background) w-full h-full`,
                className,
            )}
        >
            <div className="flex gap-2 items-center">
                <IconWrapper
                    className="border border-(--border)"
                    width={14}
                    height={14}
                    src={`/icons/add/${systemTheme}.svg`}
                    alt="add"
                    onClick={onOpenAddPanel}
                />
                <div className="relative">
                    <IconWrapper
                        width={14}
                        height={14}
                        className="border border-(--border)"
                        src={`/icons/visible/${systemTheme}.svg`}
                        alt="filter"
                        onClick={onToggleColumnPopup}
                    />
                </div>
                <div
                    className="flex justify-center items-center w-[36px] h-[36px] border border-(--border) rounded-md cursor-pointer hover:opacity-70 transition-opacity"
                    onClick={onReset}
                    title="초기화"
                >
                    <RotateCcw size={12} className="text-(--foreground)" />
                </div>
            </div>
            <div className="flex-1"></div>
            <div className="flex gap-2 h-[36px]">
                <div className="w-60 h-full">
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
                    className="h-full px-4 text-xs"
                >
                    검색
                </Button>
            </div>
        </div>
    );
}
