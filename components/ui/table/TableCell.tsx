import React from "react";
import clsx from "clsx";
import { DataTableColumn } from "./types";
import TableCellEditor from "./TableCellEditor";

interface TableCellProps<T> {
    row: T & { id: string };
    column: DataTableColumn;
    index: number;
    isLastSticky: boolean;
    isSelected: boolean;
    width: string;
    left?: string;
    systemTheme: string;
    editingCell: { rowId: string; columnKey: string } | null;
    onEditStart: () => void;
    onCellUpdate?: (rowId: string, columnKey: string, value: any) => void;
    onEditEnd: () => void;
}

export function TableCell<T>({
    row,
    column,
    index,
    isLastSticky,
    isSelected,
    width,
    left,
    systemTheme,
    editingCell,
    onEditStart,
    onCellUpdate,
    onEditEnd,
}: TableCellProps<T>) {
    const isEditingCell =
        editingCell?.rowId === row.id && editingCell?.columnKey === column.key;

    return (
        
        <div
            key={column.key}
            className={clsx(
                `table-cell group-hover:bg-(--background-surface)`,
                column.sticky && "table-cell-sticky",
                isLastSticky && "table-cell-last-sticky",
                isSelected
                    ? "bg-(--background-surface)"
                    : "bg-(--background)",
                isEditingCell &&
                    "ring-2 ring-inset ring-(--primary) overflow-visible! relative is-editing-cell",
            )}
            onClick={(e) => {
                e.stopPropagation();

                if (column.editable) {
                    if (!isEditingCell) {
                        onEditStart();
                    }
                }
            }}
            style={{
                width,
                minWidth: column.minWidth,
                maxWidth: column.maxWidth,
                left: column.sticky ? left : undefined,
                justifyContent: isEditingCell ? "stretch" : column.cellAlign,
                padding: isEditingCell ? 0 : undefined,
                overflow: isEditingCell ? "visible" : undefined,
            }}
        >
            {isEditingCell ? (
                <TableCellEditor
                    initialValue={
                        column.getEditValue
                            ? column.getEditValue(row)
                            : (row as any)[column.key]
                    }
                    type={column.type}
                    options={column.options}
                    onSave={(val) => {
                        onCellUpdate?.(row.id, column.key, val);
                        onEditEnd();
                    }}
                    onCancel={onEditEnd}
                />
            ) : column.render ? (
                column.render(row)
            ) : (
                (row as any)[column.key]
            )}
        </div>
    );
}
