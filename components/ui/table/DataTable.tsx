import React, {
    Dispatch,
    SetStateAction,
    useCallback,
    useRef,
    useState,
} from "react";
import clsx from "clsx";
import "@/styles/table.css";
import Image from "next/image";
import ThemeHook from "@/hooks/ThemeHook";
import { ChevronDown, ArrowUp, ArrowDown } from "lucide-react";
import IconWrapper from "../IconWrapper";
import useDropdownState, { ColumnKey } from "@/hooks/useDropdownState";
import TableCellEditor from "./TableCellEditor";

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
    type?: "text" | "select" | "date" | "phone" | "price";
    options?: { label: string; value: string | number }[];
    editable?: boolean;
    getEditValue?: (item: any) => any;
}

interface DataTableProps<T> {
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
    isLoading?: boolean; // For "Fetching Next Page"
    isInitialLoading?: boolean; // For "Initial Load"
    newlyCreatedId?: string | null;
}

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
    const resizingRef = useRef<{
        startX: number;
        startWidth: number;
        key: string;
    } | null>(null);

    const [sortColumnKey, setSortColumnKey] = useState<ColumnKey | null>(null);
    const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("ASC");
    
    // Cell Editing State
    const [editingCell, setEditingCell] = useState<{
        rowId: string;
        columnKey: string;
    } | null>(null);

    // Infinite Scroll Observer
    const observerTarget = useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoading && !isInitialLoading && onLoadMore) {
                    onLoadMore();
                }
            },
            { threshold: 0.1, rootMargin: '100px' }
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


    const {
        dropdownOpen, // Record<ColumnKey, boolean>
        toggleDropdown, // 컬럼 키 드롭다운 prev => !prev
        setDropdownOpenState, //직접 boolean 주입
        closeAllDropdowns,
        isAnyOpen,
        dropdownRef,
    } = useDropdownState();

    const handleMouseDown = useCallback(
        (e: React.MouseEvent, key: string) => {
            e.preventDefault();
            e.stopPropagation();
            const startX = e.clientX;
            const startWidth = (e.currentTarget.parentElement as HTMLElement)
                .offsetWidth;
            resizingRef.current = { startX, startWidth, key };

            const handleMouseMove = (moveEvent: MouseEvent) => {
                if (!resizingRef.current) return;
                const { key, startX, startWidth } = resizingRef.current;
                const diff = moveEvent.clientX - startX;
                const width = startWidth + diff;

                const col = columns.find((c) => c.key === key);
                const minWidth = col ? parseInt(col.minWidth) || 50 : 50;
                const maxWidth = col ? parseInt(col.maxWidth) || 1000 : 1000;

                const newWidth = Math.min(Math.max(minWidth, width), maxWidth);
                onColumnResize(key, newWidth);
            };

            const handleMouseUp = () => {
                resizingRef.current = null;
                document.removeEventListener("mousemove", handleMouseMove);
                document.removeEventListener("mouseup", handleMouseUp);
                document.body.style.cursor = "default";
            };

            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
            document.body.style.cursor = "col-resize";
        },
        [columns, onColumnResize]
    );

    const getWidth = useCallback(
        (key: string) => {
            const col = columns.find((c) => c.key === key);
            if (columnWidths[key]) return `${columnWidths[key]}px`;
            return col?.width || "100px";
        },
        [columns, columnWidths]
    );

    const getLeft = useCallback(
        (index: number) => {
            let left = 48; // Checkbox width hardcoded for now as per original design
            for (let i = 0; i < index; i++) {
                const key = columns[i].key;
                const width = columnWidths[key]
                    ? columnWidths[key]
                    : parseInt(columns[i].width);
                left += width;
            }
            return `${left}px`;
        },
        [columns, columnWidths]
    );

    const handleToggleDropdown = useCallback(
        (columnName: string) => {
            if (!dropdownOpen[columnName as ColumnKey]) {
                closeAllDropdowns();
            }
            toggleDropdown(columnName as ColumnKey);
        },
        [dropdownOpen, closeAllDropdowns, toggleDropdown]
    );

    // Early return for theme readiness to prevent flash of wrong theme
    if (!isThemeReady) {
        return (
             <div
                className={clsx(
                    "border border-(--table-border) rounded-md text-sm overflow-auto relative scrollbar-hide-vertical",
                    className
                )}
            />
        );
    }

    return (
        <div
            className={clsx(
                "border border-(--table-border) rounded-md text-sm relative h-full overflow-hidden",
                className
            )}
        >
            {isInitialLoading && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-(--background)/50 backdrop-blur-sm">
                    <Image
                        src={`/icons/spinner/${systemTheme}.svg`}
                        width={16}
                        height={16}
                        alt="Loading..."
                    />
                </div>
            )}
            <div className="table overflow-auto scrollbar-hide-vertical ">
                <div className="table-header" ref={dropdownRef}>
                    <div className="table-row">
                        <div className="table-cell table-cell-sticky">
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
                            const lastStickyIndex = columns
                                .map((c) => c.sticky)
                                .lastIndexOf(true);
                            const isLastSticky = i === lastStickyIndex;

                            return (
                                <>
                                    <div
                                        key={column.key}
                                        draggable={!column.sticky}
                                        onDragStart={(e) => {
                                            if (column.sticky) {
                                                e.preventDefault();
                                                return;
                                            }
                                            e.dataTransfer.setData(
                                                "text/plain",
                                                column.key
                                            );
                                            e.dataTransfer.effectAllowed =
                                                "move";
                                            // Optional: Add drag styling here
                                        }}
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            e.dataTransfer.dropEffect = "move";
                                        }}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            // Prevent dropping onto sticky columns
                                            if (column.sticky) return;

                                            const draggedKey = e.dataTransfer.getData("text/plain");
                                            const targetKey = column.key;
                                            
                                            if (draggedKey === targetKey) return;
                                            
                                            // Ensure both keys exist in current columns
                                            const currentOrder = columns.map(c => c.key);
                                            const draggedIndex = currentOrder.indexOf(draggedKey);
                                            const targetIndex = currentOrder.indexOf(targetKey);
                                            
                                            // Additional safety: ensure dragged item is found (and presumably not sticky if we only allow dragging non-sticky)
                                            if (draggedIndex > -1 && targetIndex > -1) {
                                                const newOrder = [...currentOrder];
                                                newOrder.splice(draggedIndex, 1);
                                                newOrder.splice(targetIndex, 0, draggedKey);
                                                onColumnReorder?.(newOrder);
                                            }
                                        }}
                                        className={clsx(
                                            `w-full flex justify-between`,
                                            `table-cell relative group z-20`,
                                            column.sticky &&
                                                "table-cell-sticky",
                                            isLastSticky &&
                                                "table-cell-last-sticky"
                                        )}
                                        style={{
                                            width: getWidth(column.key),
                                            minWidth: column.minWidth,
                                            maxWidth: column.maxWidth,
                                            left: column.sticky
                                                ? getLeft(i)
                                                : undefined,
                                        }}
                                    >
                                        <div
                                            className={clsx(
                                                "flex items-center gap-1",
                                                sortConfig?.key ===
                                                    column.key &&
                                                    "font-bold text-(--primary)"
                                            )}
                                        >
                                            <span>{column.name}</span>
                                            {sortConfig?.key === column.key && (
                                                <div className="text-(--primary)">
                                                    {sortConfig.direction ===
                                                    "asc" ? (
                                                        <ArrowUp size={12} />
                                                    ) : (
                                                        <ArrowDown size={12} />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <IconWrapper
                                            className=""
                                            onClick={() =>
                                                handleToggleDropdown(
                                                    column.name
                                                )
                                            }
                                            width={24}
                                            height={24}
                                        >
                                            <ChevronDown
                                                className={`${
                                                    dropdownOpen[
                                                        column.name as ColumnKey
                                                    ] && "-rotate-180"
                                                } duration-200 transition-all`}
                                                width={12}
                                                height={12}
                                            />
                                        </IconWrapper>
                                        <div
                                            className="absolute right-0 top-0 w-[2.5px] h-full cursor-col-resize hover:bg-(--primary) opacity-0 group-hover:opacity-100 transition-opacity"
                                            onMouseDown={(e) =>
                                                handleMouseDown(e, column.key)
                                            }
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        {dropdownOpen[
                                            column.name as ColumnKey
                                        ] && (
                                            <div
                                                style={{
                                                    width: `calc(${getWidth(
                                                        column.key
                                                    )} - 20px)`,
                                                }}
                                                className="min-h-max min-w-max flex flex-col gap-1 absolute right-[2px] top-full mt-[3px] table-cell-dropdown bg-(--background) border border-(--table-border) rounded-md p-1"
                                            >
                                                <div
                                                    className="px-2 py-1 hover:opacity-80 hover:bg-(--background) rounded-md cursor-pointer"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onSort?.(
                                                            column.key,
                                                            "asc"
                                                        );
                                                        handleToggleDropdown(
                                                            column.name
                                                        );
                                                    }}
                                                >
                                                    오름차순 정렬
                                                </div>
                                                <div
                                                    className="px-2 py-1 hover:opacity-80 hover:bg-(--background) cursor-pointer"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onSort?.(
                                                            column.key,
                                                            "desc"
                                                        );
                                                        handleToggleDropdown(
                                                            column.name
                                                        );
                                                    }}
                                                >
                                                    내림차순 정렬
                                                </div>

                                                    {/* Filter Options */}
                                                    {(column.type === "select" ||
                                                        (column.options &&
                                                            column.options.length >
                                                                0)) &&
                                                        column.options && (
                                                            <>
                                                                <div
                                                                    className="px-2 py-1.5 mb-1 text-xs text-(--foreground-muted) hover:text-(--foreground) hover:bg-(--background) rounded-md cursor-pointer border-b border-(--border-surface)"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        onFilterChange?.(column.key, []);
                                                                    }}
                                                                >
                                                                    필터 초기화
                                                                </div>
                                                                <div className="max-h-[200px] overflow-y-auto flex flex-col gap-0.5">
                                                                {column.options.map(
                                                                    (
                                                                        option
                                                                    ) => {
                                                                        const isSelected =
                                                                            filters?.[
                                                                                column
                                                                                    .key
                                                                            ]?.includes(
                                                                                option.value.toString()
                                                                            );
                                                                        return (
                                                                            <div
                                                                                key={
                                                                                    option.value
                                                                                }
                                                                                className="flex items-center gap-2 px-2 py-1.5 hover:bg-(--background) rounded-md cursor-pointer"
                                                                                onClick={(
                                                                                    e
                                                                                ) => {
                                                                                    e.stopPropagation();
                                                                                    
                                                                                    const currentFilters =
                                                                                        filters?.[
                                                                                            column
                                                                                                .key
                                                                                        ] ||
                                                                                        [];
                                                                                    const newFilters =
                                                                                        isSelected
                                                                                            ? currentFilters.filter(
                                                                                                  (
                                                                                                      v
                                                                                                  ) =>
                                                                                                      v !==
                                                                                                      option.value.toString()
                                                                                              )
                                                                                            : [
                                                                                                  ...currentFilters,
                                                                                                  option.value.toString(),
                                                                                              ];
                                                                                    onFilterChange?.(
                                                                                        column.key,
                                                                                        newFilters
                                                                                    );
                                                                                }}
                                                                            >
                                                                                <Image
                                                                                    src={`/icons/${
                                                                                        isSelected
                                                                                            ? "checkbox"
                                                                                            : "uncheck"
                                                                                    }/${systemTheme}.svg`}
                                                                                    width={
                                                                                        16
                                                                                    }
                                                                                    height={
                                                                                        16
                                                                                    }
                                                                                    alt="check"
                                                                                />
                                                                                <span className="whitespace-nowrap">
                                                                                    {
                                                                                        option.label
                                                                                    }
                                                                                </span>
                                                                            </div>
                                                                        );
                                                                    }
                                                                )}
                                                            </div>
                                                        </>
                                                    )}
                                            </div>
                                        )}
                                    </div>
                                    {/* {isAnyOpen && (
                                        <div
                                            onClick={closeAllDropdowns}
                                            className="fixed inset-0 w-full h-full opacity-0 z-10"
                                        ></div>
                                    )} */}
                                </>
                            );
                        })}
                    </div>
                </div>
                <div className="table-body">
                    {data && data.length > 0 ? (
                        data.map((row, rowIndex) => {
                            const isEditingRow = editingCell?.rowId === row.id;
                            const isNewRow = newlyCreatedId === row.id;
                            return (
                                <div
                                    key={row.id || rowIndex}
                                    className={clsx("table-row cursor-pointer", isEditingRow && "is-editing-row", isNewRow && "table-row-new")}
                                    onClick={() => onRowClick?.(row)}
                                    style={{ zIndex: isEditingRow ? 500 : undefined, position: isEditingRow ? 'relative' : undefined }}
                                >
                                <div
                                    className={clsx(
                                        `table-cell table-cell-sticky`,
                                        selectedIds?.includes(row.id)
                                            ? "bg-(--background-surface)"
                                            : "bg-(--background)"
                                    )}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRowSelect(row.id);
                                    }}
                                >
                                    <div className="flex justify-center items-center cursor-pointer">
                                        <Image
                                            src={`/icons/${
                                                selectedIds?.includes(row.id)
                                                    ? "checkbox"
                                                    : "uncheck"
                                            }/${systemTheme}.svg`}
                                            width={16}
                                            height={16}
                                            alt="check"
                                        />
                                    </div>
                                </div>
                                {columns.map((column, i) => {
                                    const lastStickyIndex = columns
                                        .map((c) => c.sticky)
                                        .lastIndexOf(true);
                                    const isLastSticky = i === lastStickyIndex;
                                    const isEditingCell = editingCell?.rowId === row.id && editingCell?.columnKey === column.key;

                                    return (
                                        <div
                                            key={column.key}
                                            className={clsx(
                                                `table-cell`,
                                                column.sticky &&
                                                    "table-cell-sticky",
                                                isLastSticky &&
                                                    "table-cell-last-sticky",
                                                selectedIds?.includes(row.id)
                                                    ? "bg-(--background-surface)"
                                                    : "bg-(--background)",
                                                isEditingCell && "ring-2 ring-inset ring-(--primary) z-200 overflow-visible! relative is-editing-cell"
                                            )}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                
                                                if (column.editable) {
                                                    if (!isEditingCell) {
                                                        setEditingCell({
                                                            rowId: row.id,
                                                            columnKey: column.key,
                                                        });
                                                    }
                                                }
                                            }}
                                            style={{
                                                width: getWidth(column.key),
                                                minWidth: column.minWidth,
                                                maxWidth: column.maxWidth,
                                                left: column.sticky
                                                    ? getLeft(i)
                                                    : undefined,
                                                justifyContent: isEditingCell ? 'stretch' : column.cellAlign,
                                                padding: isEditingCell ? 0 : undefined,
                                                zIndex: isEditingCell ? 501 : undefined,
                                                overflow: isEditingCell ? 'visible' : undefined,
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
                                                        setEditingCell(null);
                                                    }}
                                                    onCancel={() => setEditingCell(null)}
                                                />
                                            ) : (
                                                column.render
                                                    ? column.render(row)
                                                    : (row as any)[column.key]
                                            )}
                                        </div>
                                    );
                                })}
                                </div>
                            );
                        })
                    ) : (
                        !isLoading && !isInitialLoading && (
                            <div className="flex flex-col items-center justify-center p-8 text-(--foreground-muted) h-[200px]">
                            </div>
                        )
                    )}
                    {/* Infinite Scroll Trigger */}
                    {hasMore && (
                        <div ref={observerTarget} className="h-4 w-full flex justify-center items-center">
                            {isLoading && <span className="text-xs text-(--foreground-muted)">불러오는 중...</span>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
