"use client";

import React from "react";
import clsx from "clsx";
import ThemeHook from "@/hooks/ThemeHook";
import Image from "next/image";

import { Lock, Unlock } from "lucide-react";

interface ColumnVisibilityPopupProps {
    className?: string;
    isOpen: boolean;
    columnLabels: Record<string, string>;
    visibleColumns: Record<string, boolean>;
    setVisibleColumns: (cols: Record<string, boolean>) => void;
    stickyColumns?: Record<string, boolean>;
    setStickyColumns?: (cols: Record<string, boolean>) => void;
    defaultColumns?: string[]; // Keys of columns that should be true by default
    onReset?: () => void; // Optional custom reset handler
}

export function ColumnVisibilityPopup({
    className,
    isOpen,
    columnLabels,
    visibleColumns,
    setVisibleColumns,
    stickyColumns,
    setStickyColumns,
    defaultColumns,
    onReset,
}: ColumnVisibilityPopupProps) {
    const { systemTheme } = ThemeHook();

    const isAllSelected = Object.keys(columnLabels).every(
        (key) => visibleColumns[key]
    );

    const handleSelectAll = () => {
        const newVisibility = Object.keys(columnLabels).reduce((acc, key) => {
            acc[key] = !isAllSelected;
            return acc;
        }, {} as Record<string, boolean>);
        setVisibleColumns(newVisibility);
    };

    const handleReset = () => {
        if (onReset) {
            onReset();
            return;
        }
        if (defaultColumns) {
            const newVisibility = Object.keys(columnLabels).reduce(
                (acc, key) => {
                    acc[key] = defaultColumns.includes(key);
                    return acc;
                },
                {} as Record<string, boolean>
            );
            setVisibleColumns(newVisibility);
        }
    };

    return (
        <div
            className={clsx(
                "overflow-auto transition-all duration-200",
                isOpen
                    ? "min-h-max p-2 bg-(--background) border border-(--border-surface) rounded-md"
                    : "max-h-0 p-0 border-transparent invisible",
                className
            )}
        >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.entries(columnLabels).map(([key, label]) => (
                    <div
                        key={key}
                        className="flex items-center justify-between gap-2 px-2 py-1 rounded hover:bg-(--bg-hover) group"
                    >
                        <label className="flex items-center gap-2 cursor-pointer flex-1">
                            <div
                                onClick={(e) => {
                                    e.preventDefault(); // Prevent double toggling if label is clicked
                                    setVisibleColumns({
                                        ...visibleColumns,
                                        [key]: !visibleColumns[key],
                                    });
                                }}
                                className="cursor-pointer shrink-0"
                            >
                                <Image
                                    src={`/icons/${
                                        visibleColumns[key]
                                            ? "checkbox"
                                            : "uncheck"
                                    }/${systemTheme}.svg`}
                                    alt="checkbox"
                                    width={16}
                                    height={16}
                                />
                            </div>
                            <span className="text-xs text-(--foreground) truncate select-none">
                                {label}
                            </span>
                        </label>
                        {setStickyColumns && (
                            <div
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setStickyColumns({
                                        ...stickyColumns,
                                        [key]: !stickyColumns?.[key],
                                    });
                                }}
                                className="cursor-pointer p-0.5 rounded hover:bg-(--background-surface) text-(--foreground-muted) transition-colors"
                                title={stickyColumns?.[key] ? "고정 해제" : "컬럼 고정"}
                            >
                                {stickyColumns?.[key] ? (
                                    <Lock size={12} className="text-(--primary)" />
                                ) : (
                                    <Unlock size={12} />
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <div className="mt-3 flex gap-2">
                <button
                    onClick={handleSelectAll}
                    className="px-3 py-2 text-xs text-(--foreground) border border-(--border-surface) rounded-md hover:bg-(--bg-hover) transition-colors"
                >
                    {isAllSelected ? "전체 해제" : "전체 선택"}
                </button>
                {(defaultColumns || onReset) && (
                    <button
                        onClick={handleReset}
                        className="px-3 py-2 text-xs text-(--foreground) border border-(--border-surface) rounded-md hover:bg-(--bg-hover) transition-colors"
                    >
                        기본 선택
                    </button>
                )}
            </div>
        </div>
    );
}
