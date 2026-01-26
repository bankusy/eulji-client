import React, { useState } from "react";
import clsx from "clsx";
import "@/styles/table.css";
import Image from "next/image";
import ThemeHook from "@/hooks/ThemeHook";
import { DataTableProps } from "./types";
import { TableHeader } from "./TableHeader";
import { TableBody } from "./TableBody";

export * from "./types";

export function DataTable<T extends { id: string }>({
    className,
    data,
    columns,
    columnWidths,
    onColumnResize,
    isEditing,
    allCheck,
    onAllCheck,
    selectedIds,
    onRowSelect,
    onRowClick,
    onSort,
    filters,
    onFilterChange,
    onColumnReorder,
    sortConfig,
    onCellUpdate,
    onLoadMore,
    hasMore,
    isLoading,
    isInitialLoading,
    newlyCreatedId,
}: DataTableProps<T>) {
    const { systemTheme, isThemeReady } = ThemeHook();

    // Cell Editing State
    const [editingCell, setEditingCell] = useState<{
        rowId: string;
        columnKey: string;
    } | null>(null);

    // Early return for theme readiness to prevent flash of wrong theme
    if (!isThemeReady) {
        return (
            <div
                className={clsx(
                    "border border-(--border-surface) rounded-md text-sm overflow-auto relative scrollbar-hide-vertical",
                    className,
                )}
            />
        );
    }

    return (
        <div
            className={clsx(
                "border border-(--border-surface) rounded-md text-sm relative h-full overflow-hidden",
                className,
            )}
        >
            {isInitialLoading && (
                <div className="absolute inset-0 z-(--z-modal) flex items-center justify-center bg-(--background)/50 backdrop-blur-sm">
                    <Image
                        src={`/icons/spinner/${systemTheme}.svg`}
                        width={16}
                        height={16}
                        alt="Loading..."
                    />
                </div>
            )}
            <div className="table overflow-auto scrollbar-hide-vertical">
                <TableHeader
                    columns={columns}
                    columnWidths={columnWidths}
                    allCheck={allCheck}
                    systemTheme={systemTheme}
                    sortConfig={sortConfig}
                    filters={filters}
                    onAllCheck={onAllCheck}
                    onColumnResize={onColumnResize}
                    onSort={onSort}
                    onFilterChange={onFilterChange}
                    onColumnReorder={onColumnReorder}
                />
                <TableBody
                    data={data}
                    columns={columns}
                    columnWidths={columnWidths}
                    selectedIds={selectedIds}
                    systemTheme={systemTheme}
                    editingCell={editingCell}
                    newlyCreatedId={newlyCreatedId}
                    hasMore={hasMore}
                    isLoading={isLoading}
                    isInitialLoading={isInitialLoading}
                    onRowSelect={onRowSelect}
                    onRowClick={onRowClick}
                    onCellUpdate={onCellUpdate}
                    setEditingCell={setEditingCell}
                    onLoadMore={onLoadMore}
                />
            </div>
        </div>
    );
}
