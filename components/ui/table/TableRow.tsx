import React, { useCallback } from "react";
import Image from "next/image";
import clsx from "clsx";
import { DataTableColumn } from "./types";
import { TableCell } from "./TableCell";

interface TableRowProps<T> {
    row: T & { id: string };
    rowIndex: number;
    columns: DataTableColumn[];
    columnWidths: Record<string, number>;
    isSelected: boolean;
    isNewRow: boolean;
    systemTheme: string;
    editingCell: { rowId: string; columnKey: string } | null;
    onRowSelect: (id: string) => void;
    onRowClick?: (item: T) => void;
    onCellUpdate?: (rowId: string, columnKey: string, value: any) => void;
    setEditingCell: (cell: { rowId: string; columnKey: string } | null) => void;
}

export function TableRow<T>({
    row,
    rowIndex,
    columns,
    columnWidths,
    isSelected,
    isNewRow,
    systemTheme,
    editingCell,
    onRowSelect,
    onRowClick,
    onCellUpdate,
    setEditingCell,
}: TableRowProps<T>) {
    const isEditingRow = editingCell?.rowId === row.id;

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

    const lastStickyIndex = columns.map((c) => c.sticky).lastIndexOf(true);

    return (
        <div
            key={row.id || rowIndex}
            className={clsx(
                "table-row cursor-pointer group",
                isEditingRow && "is-editing-row",
                isNewRow && "table-row-new",
            )}
            onClick={() => onRowClick?.(row)}
        >
            <div
                className={clsx(
                    `table-cell table-cell-sticky group-hover:bg-(--background-surface)`,
                    isSelected
                        ? "bg-(--background-surface)"
                        : "bg-(--background)",
                )}
                onClick={(e) => {
                    e.stopPropagation();
                    onRowSelect(row.id);
                }}
            >
                <div className="flex justify-center items-center cursor-pointer">
                    <Image
                        src={`/icons/${
                            isSelected ? "checkbox" : "uncheck"
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
                    <TableCell
                        key={column.key}
                        row={row}
                        column={column}
                        index={i}
                        isLastSticky={isLastSticky}
                        isSelected={isSelected}
                        width={getWidth(column.key)}
                        left={column.sticky ? getLeft(i) : undefined}
                        systemTheme={systemTheme}
                        editingCell={editingCell}
                        onEditStart={() =>
                            setEditingCell({
                                rowId: row.id,
                                columnKey: column.key,
                            })
                        }
                        onCellUpdate={onCellUpdate}
                        onEditEnd={() => setEditingCell(null)}
                    />
                );
            })}
        </div>
    );
}
