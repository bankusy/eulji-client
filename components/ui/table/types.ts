import React from "react";

export interface DataTableColumn {
    key: string;
    name: string;
    width: string;
    minWidth: string;
    maxWidth: string;
    sticky?: boolean;
    headerAlign: string;
    cellAlign: string;
    render?: (item: any) => React.ReactNode;
    type?: "text" | "select" | "date" | "phone" | "price" | "area" | "floor";
    options?: { label: string; value: string | number }[];
    editable?: boolean;
    getEditValue?: (item: any) => any;
}

export interface DataTableProps<T> {
    className?: string;
    data: T[] | null;
    columns: DataTableColumn[];
    columnWidths: Record<string, number>;
    isEditing: boolean;
    allCheck: boolean;
    selectedIds: string[] | null;
    onColumnResize: (key: string, newWidth: number) => void;
    onAllCheck: () => void;
    onRowSelect: (id: string) => void;
    onRowClick?: (item: T) => void;
    onSort?: (column: string, direction: "asc" | "desc") => void;
    filters?: Record<string, string[]>;
    onFilterChange?: (columnKey: string, values: string[]) => void;
    onColumnReorder?: (newOrder: string[]) => void;
    sortConfig?: { key: string; direction: "asc" | "desc" } | null;
    onCellUpdate?: (rowId: string, columnKey: string, value: any) => void;

    // Infinite Scroll
    onLoadMore?: () => void;
    hasMore?: boolean;
    isLoading?: boolean;
    isInitialLoading?: boolean;
    newlyCreatedId?: string | null;
}
