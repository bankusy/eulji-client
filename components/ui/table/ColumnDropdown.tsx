import React from "react";
import Image from "next/image";
import { DataTableColumn } from "./types";
import { Check } from "lucide-react";

interface ColumnDropdownProps {
    column: DataTableColumn;
    systemTheme: string;
    width: string;
    sortConfig?: { key: string; direction: "asc" | "desc" } | null;
    onSort: (direction: "asc" | "desc" | null) => void;
    onFilterChange?: (values: string[]) => void;
    filters?: string[];
    onClose: () => void;
}

export function ColumnDropdown({
    column,
    systemTheme,
    width,
    sortConfig,
    onSort,
    onFilterChange,
    filters = [],
    onClose,
}: ColumnDropdownProps) {
    // Calculate dropdown position
    const headerCell = document.querySelector(
        `[data-column-key="${column.key}"]`,
    ) as HTMLElement;
    const rect = headerCell?.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - (rect?.bottom || 0);
    const shouldOpenUp =
        spaceBelow < 300 && (rect?.top || 0) > spaceBelow;

    return (
        <div
            style={{
                width: `calc(${width} - 20px)`,
            }}
            className={`min-h-max min-w-max flex flex-col gap-1 absolute left-0 ${
                shouldOpenUp ? "bottom-full mb-2" : "top-full mt-2"
            } z-(--z-dropdown) table-cell-dropdown bg-(--background-subtle) border border-(--border-subtle) p-1 rounded-sm`}
        >
            <div
                className="px-2 py-1 hover:opacity-80 hover:bg-(--background) cursor-pointer flex items-center gap-2"
                onClick={(e) => {
                    e.stopPropagation();
                    // 현재 오름차순이 선택되어 있으면 해제, 아니면 오름차순 설정
                    const newDirection = (sortConfig?.key === column.key && sortConfig?.direction === "asc") ? null : "asc";
                    onSort(newDirection);
                    onClose();
                }}
            >
                <span>오름차순 정렬</span>
                {sortConfig?.key === column.key && sortConfig?.direction === "asc" && (
                    <Check size={14} className="text-(--primary)" />
                )}
            </div>
            <div
                className="px-2 py-1 hover:opacity-80 hover:bg-(--background) cursor-pointer flex items-center gap-2"
                onClick={(e) => {
                    e.stopPropagation();
                    // 현재 내림차순이 선택되어 있으면 해제, 아니면 내림차순 설정
                    const newDirection = (sortConfig?.key === column.key && sortConfig?.direction === "desc") ? null : "desc";
                    onSort(newDirection);
                    onClose();
                }}
            >
                <span>내림차순 정렬</span>
                {sortConfig?.key === column.key && sortConfig?.direction === "desc" && (
                    <Check size={14} className="text-(--primary)" />
                )}
            </div>

            {/* Filter Options */}
            {(column.type === "select" ||
                (column.options && column.options.length > 0)) &&
                column.options && (
                    <>
                        <div
                            className="px-2 py-1.5 mb-1 text-xs text-(--foreground-muted) hover:text-(--foreground) hover:bg-(--background) cursor-pointer border-b border-(--border-surface)"
                            onClick={(e) => {
                                e.stopPropagation();
                                onFilterChange?.([]);
                            }}
                        >
                            필터 초기화
                        </div>
                        <div className="max-h-[200px] overflow-y-auto flex flex-col gap-0.5 scrollbar-hide-vertical">
                            {column.options.map((option) => {
                                const isSelected = filters.includes(
                                    option.value.toString(),
                                );
                                return (
                                    <div
                                        key={option.value}
                                        className="flex items-center gap-2 px-2 py-1.5 hover:bg-(--background-surface) cursor-pointer"
                                        onClick={(e) => {
                                            e.stopPropagation();

                                            const newFilters = isSelected
                                                ? filters.filter(
                                                      (v) =>
                                                          v !==
                                                          option.value.toString(),
                                                  )
                                                : [
                                                      ...filters,
                                                      option.value.toString(),
                                                  ];
                                            onFilterChange?.(newFilters);
                                        }}
                                    >
                                        <Image
                                            src={`/icons/${
                                                isSelected
                                                    ? "checkbox"
                                                    : "uncheck"
                                            }/${systemTheme}.svg`}
                                            width={16}
                                            height={16}
                                            alt="check"
                                        />
                                        <span className="whitespace-nowrap">
                                            {option.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
        </div>
    );
}
