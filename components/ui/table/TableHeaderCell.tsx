import React, { useCallback } from "react";
import clsx from "clsx";
import { ArrowUp, ArrowDown, ChevronDown } from "lucide-react";
import { DataTableColumn } from "./types";
import { ColumnDropdown } from "./ColumnDropdown";
import IconWrapper from "@/components/ui/IconWrapper";

interface TableHeaderCellProps {
    column: DataTableColumn;
    index: number;
    isLastSticky: boolean;
    width: string;
    left?: string;
    sortConfig?: { key: string; direction: "asc" | "desc" } | null;
    dropdownOpen: boolean;
    systemTheme: string;
    onToggleDropdown: () => void;
    onMouseDown: (e: React.MouseEvent) => void;
    onSort?: (column: string, direction: "asc" | "desc") => void;
    onFilterChange?: (columnKey: string, values: string[]) => void;
    filters?: Record<string, string[]>;
    onColumnReorder?: (newOrder: string[]) => void;
    columns: DataTableColumn[];
}

export function TableHeaderCell({
    column,
    index,
    isLastSticky,
    width,
    left,
    sortConfig,
    dropdownOpen,
    systemTheme,
    onToggleDropdown,
    onMouseDown,
    onSort,
    onFilterChange,
    filters,
    onColumnReorder,
    columns,
}: TableHeaderCellProps) {
    return (
        <div
            key={column.key}
            data-column-key={column.key}
            draggable={!column.sticky}
            onDragStart={(e) => {
                if (column.sticky) {
                    e.preventDefault();
                    return;
                }
                e.dataTransfer.setData("text/plain", column.key);
                e.dataTransfer.effectAllowed = "move";
            }}
            onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
            }}
            onDrop={(e) => {
                e.preventDefault();
                if (column.sticky) return;

                const draggedKey = e.dataTransfer.getData("text/plain");
                const targetKey = column.key;

                if (draggedKey === targetKey) return;

                const currentOrder = columns.map((c) => c.key);
                const draggedIndex = currentOrder.indexOf(draggedKey);
                const targetIndex = currentOrder.indexOf(targetKey);

                if (draggedIndex > -1 && targetIndex > -1) {
                    const newOrder = [...currentOrder];
                    newOrder.splice(draggedIndex, 1);
                    newOrder.splice(targetIndex, 0, draggedKey);
                    onColumnReorder?.(newOrder);
                }
            }}
            className={clsx(
                `w-full flex justify-between`,
                `table-cell relative group bg-(--background-surface)`,
                column.sticky && "table-cell-sticky",
                isLastSticky && "table-cell-last-sticky",
            )}
            style={{
                width,
                minWidth: column.minWidth,
                maxWidth: column.maxWidth,
                left: column.sticky ? left : undefined,
            }}
        >
            <div
                className={clsx(
                    "flex items-center gap-1",
                    sortConfig?.key === column.key &&
                        "font-bold text-(--primary)",
                )}
            >
                <span>{column.name}</span>
                {sortConfig?.key === column.key && (
                    <div className="text-(--primary)">
                        {sortConfig.direction === "asc" ? (
                            <ArrowUp size={12} />
                        ) : (
                            <ArrowDown size={12} />
                        )}
                    </div>
                )}
            </div>
            <IconWrapper
                className=""
                onClick={onToggleDropdown}
                width={24}
                height={24}
            >
                <ChevronDown
                    className={`${
                        dropdownOpen && "-rotate-180"
                    } duration-200 transition-all`}
                    width={12}
                    height={12}
                />
            </IconWrapper>
            <div
                className="absolute right-0 top-0 w-[2.5px] h-full cursor-col-resize opacity-0 group-hover:opacity-100 transition-opacity"
                onMouseDown={onMouseDown}
                onClick={(e) => e.stopPropagation()}
            />
            {dropdownOpen && (
                <ColumnDropdown
                    column={column}
                    systemTheme={systemTheme}
                    width={width}
                    sortConfig={sortConfig}
                    onSort={(direction) => {
                        if (direction === null) {
                            // 정렬 해제: 다른 컴포넌트에서 처리할 수 있도록 null 전달
                            onSort?.(column.key, "asc"); // 더미로 전달, 페이지에서 null 처리
                        } else {
                            onSort?.(column.key, direction);
                        }
                    }}
                    onFilterChange={(values) =>
                        onFilterChange?.(column.key, values)
                    }
                    filters={filters?.[column.key] || []}
                    onClose={onToggleDropdown}
                />
            )}
        </div>
    );
}
