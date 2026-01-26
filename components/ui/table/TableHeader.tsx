import React, { useCallback } from "react";
import Image from "next/image";
import clsx from "clsx";
import { DataTableColumn } from "./types";
import { TableHeaderCell } from "./TableHeaderCell";
import useDropdownState, { ColumnKey } from "@/hooks/useDropdownState";

interface TableHeaderProps {
    columns: DataTableColumn[];
    columnWidths: Record<string, number>;
    allCheck: boolean;
    systemTheme: string;
    sortConfig?: { key: string; direction: "asc" | "desc" } | null;
    filters?: Record<string, string[]>;
    onAllCheck: () => void;
    onColumnResize: (key: string, newWidth: number) => void;
    onSort?: (column: string, direction: "asc" | "desc") => void;
    onFilterChange?: (columnKey: string, values: string[]) => void;
    onColumnReorder?: (newOrder: string[]) => void;
}

export function TableHeader({
    columns,
    columnWidths,
    allCheck,
    systemTheme,
    sortConfig,
    filters,
    onAllCheck,
    onColumnResize,
    onSort,
    onFilterChange,
    onColumnReorder,
}: TableHeaderProps) {
    const {
        dropdownOpen,
        toggleDropdown,
        closeAllDropdowns,
        isAnyOpen,
        dropdownRef,
    } = useDropdownState();

    const getWidth = useCallback(
        (key: string) => {
            const col = columns.find((c) => c.key === key);
            if (columnWidths[key]) return `${columnWidths[key]}px`;
            return col?.width || "100px";
        },
        [columns, columnWidths],
    );

    const getLeft = useCallback(
        (index: number) => {
            let left = 48;
            for (let i = 0; i < index; i++) {
                const key = columns[i].key;
                const width = columnWidths[key]
                    ? columnWidths[key]
                    : parseInt(columns[i].width);
                left += width;
            }
            return `${left}px`;
        },
        [columns, columnWidths],
    );

    const handleMouseDown = useCallback(
        (e: React.MouseEvent, key: string) => {
            e.preventDefault();
            e.stopPropagation();
            const startX = e.clientX;
            const startWidth = (e.currentTarget.parentElement as HTMLElement)
                .offsetWidth;

            const handleMouseMove = (moveEvent: MouseEvent) => {
                const diff = moveEvent.clientX - startX;
                const width = startWidth + diff;

                const col = columns.find((c) => c.key === key);
                const minWidth = col ? parseInt(col.minWidth) || 50 : 50;
                const maxWidth = col ? parseInt(col.maxWidth) || 1000 : 1000;

                const newWidth = Math.min(Math.max(minWidth, width), maxWidth);
                onColumnResize(key, newWidth);
            };

            const handleMouseUp = () => {
                document.removeEventListener("mousemove", handleMouseMove);
                document.removeEventListener("mouseup", handleMouseUp);
                document.body.style.cursor = "default";
            };

            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
            document.body.style.cursor = "col-resize";
        },
        [columns, onColumnResize],
    );

    const handleToggleDropdown = useCallback(
        (columnName: string) => {
            if (!dropdownOpen[columnName as ColumnKey]) {
                closeAllDropdowns();
            }
            toggleDropdown(columnName as ColumnKey);
        },
        [dropdownOpen, closeAllDropdowns, toggleDropdown],
    );

    const lastStickyIndex = columns.map((c) => c.sticky).lastIndexOf(true);

    return (
        <div className="table-header" ref={dropdownRef}>
            <div className="table-row">
                <div className="table-cell table-cell-sticky bg-(--background-surface)">
                    <div
                        className="flex justify-center items-center cursor-pointer"
                        onClick={onAllCheck}
                    >
                        <Image
                            src={`/icons/${
                                allCheck ? "checkbox" : "uncheck"
                            }/${systemTheme}.svg`}
                            width={16}
                            height={16}
                            alt="check"
                        />
                    </div>
                </div>
                {columns.map((column, i) => {
                    const isLastSticky = i === lastStickyIndex;

                    return (
                        <TableHeaderCell
                            key={column.key}
                            column={column}
                            index={i}
                            isLastSticky={isLastSticky}
                            width={getWidth(column.key)}
                            left={column.sticky ? getLeft(i) : undefined}
                            sortConfig={sortConfig}
                            dropdownOpen={dropdownOpen[column.key as ColumnKey]}
                            systemTheme={systemTheme}
                            onToggleDropdown={() =>
                                handleToggleDropdown(column.key)
                            }
                            onMouseDown={(e) => handleMouseDown(e, column.key)}
                            onSort={onSort}
                            onFilterChange={onFilterChange}
                            filters={filters}
                            onColumnReorder={onColumnReorder}
                            columns={columns}
                        />
                    );
                })}
                {isAnyOpen && (
                    <div
                        onClick={closeAllDropdowns}
                        className="fixed inset-0 w-full h-full opacity-0 z-(--z-dropdown-backdrop)"
                    ></div>
                )}
            </div>
        </div>
    );
}
