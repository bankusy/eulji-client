import React, { useRef, useEffect } from "react";
import { DataTableColumn } from "./types";
import { TableRow } from "./TableRow";

interface TableBodyProps<T> {
    data: T[] | null;
    columns: DataTableColumn[];
    columnWidths: Record<string, number>;
    selectedIds: string[] | null;
    systemTheme: string;
    editingCell: { rowId: string; columnKey: string } | null;
    newlyCreatedId?: string | null;
    hasMore?: boolean;
    isLoading?: boolean;
    isInitialLoading?: boolean;
    onRowSelect: (id: string) => void;
    onRowClick?: (item: T) => void;
    onCellUpdate?: (rowId: string, columnKey: string, value: any) => void;
    setEditingCell: (cell: { rowId: string; columnKey: string } | null) => void;
    onLoadMore?: () => void;
}

export function TableBody<T extends { id: string }>({
    data,
    columns,
    columnWidths,
    selectedIds,
    systemTheme,
    editingCell,
    newlyCreatedId,
    hasMore,
    isLoading,
    isInitialLoading,
    onRowSelect,
    onRowClick,
    onCellUpdate,
    setEditingCell,
    onLoadMore,
}: TableBodyProps<T>) {
    const observerTarget = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (
                    entries[0].isIntersecting &&
                    hasMore &&
                    !isLoading &&
                    !isInitialLoading &&
                    onLoadMore
                ) {
                    onLoadMore();
                }
            },
            { threshold: 0.1, rootMargin: "100px" },
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => {
            if (observerTarget.current) {
                observer.unobserve(observerTarget.current);
            }
        };
    }, [hasMore, isLoading, isInitialLoading, onLoadMore]);

    return (
        <div className="table-body">
            {data && data.length > 0
                ? data.map((row, rowIndex) => {
                      console.log(rowIndex);

                      const isSelected = selectedIds?.includes(row.id) || false;
                      const isNewRow = newlyCreatedId === row.id;

                      return (
                          <TableRow
                              key={row.id || rowIndex}
                              row={row}
                              rowIndex={rowIndex}
                              columns={columns}
                              columnWidths={columnWidths}
                              isSelected={isSelected}
                              isNewRow={isNewRow}
                              systemTheme={systemTheme}
                              editingCell={editingCell}
                              onRowSelect={onRowSelect}
                              onRowClick={onRowClick}
                              onCellUpdate={onCellUpdate}
                              setEditingCell={setEditingCell}
                          />
                      );
                  })
                : !isLoading &&
                  !isInitialLoading && (
                      <div className="flex flex-col items-center justify-center p-8 text-(--foreground-muted) h-[200px]"></div>
                  )}
            {/* Infinite Scroll Trigger */}
            {hasMore && (
                <div
                    ref={observerTarget}
                    className="h-4 w-full flex justify-center items-center"
                >
                    {isLoading && (
                        <span className="text-xs text-(--foreground-muted)">
                            {/* <GlobalLoader/> */}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
