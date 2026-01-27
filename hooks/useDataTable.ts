import { useState, useMemo, useEffect } from "react";
import useLocalStorage from "@/hooks/useLocalStorage";

export interface DataTableStateOptions<T> {
    storageKeyPrefix: string;
    defaultVisibleColumns: Record<string, boolean>;
    defaultSearchColumns: Record<string, boolean>;
    defaultSort?: { column: string; direction: "asc" | "desc" };
    columnsConfiguration: { key: string; sticky?: boolean }[];
}

export function useDataTable<T extends { id: string }>(options: DataTableStateOptions<T>) {
    const {
        storageKeyPrefix,
        defaultVisibleColumns,
        defaultSearchColumns,
        defaultSort,
        columnsConfiguration
    } = options;

    // --- Search State ---
    const [searchQuery, setSearchQuery] = useState("");
    const [activeSearchQuery, setActiveSearchQuery] = useState("");
    const [searchColumns, setSearchColumns] = useLocalStorage<Record<string, boolean>>(
        `${storageKeyPrefix}_search_columns`,
        defaultSearchColumns
    );
    const [isSearchFilterOpen, setIsSearchFilterOpen] = useState(false);

    // --- Sort State ---
    const [sortConfig, setSortConfig] = useLocalStorage<{
        column: string;
        direction: "asc" | "desc";
    } | null>(`${storageKeyPrefix}_sort_config`, defaultSort || null);

    // --- Filter State ---
    const [filters, setFilters] = useState<Record<string, string[]>>({});

    // --- Selection State ---
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isAllCheck, setAllCheck] = useState(false);

    // --- Column State ---
    const [columnWidths, setColumnWidths] = useLocalStorage<Record<string, number>>(
        `${storageKeyPrefix}_column_widths`, 
        {}
    );
    const [isColumnPopupOpen, setIsColumnPopupOpen] = useState(false);
    
    // Column Visibility
    const [visibleColumns, setVisibleColumns] = useLocalStorage<Record<string, boolean>>(
        `${storageKeyPrefix}_visible_columns`, 
        defaultVisibleColumns
    );

    // Column Order
    const [columnOrder, setColumnOrder] = useLocalStorage<string[]>(
        `${storageKeyPrefix}_column_order`,
        columnsConfiguration.map(c => c.key)
    );

    // Sticky Columns
    const [stickyColumns, setStickyColumns] = useLocalStorage<Record<string, boolean>>(
        `${storageKeyPrefix}_sticky_columns`,
        columnsConfiguration.reduce((acc, col) => {
            if (col.sticky) acc[col.key] = true;
            return acc;
        }, {} as Record<string, boolean>)
    );

    // --- Handlers ---

    // Search
    const handleSearchQueryChange = (val: string) => setSearchQuery(val);
    const handleSearchSubmit = () => setActiveSearchQuery(searchQuery);
    const toggleSearchColumn = (key: string) => {
        setSearchColumns(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // Sort
    const handleSort = (column: string, direction: "asc" | "desc") => {
         if (sortConfig?.column === column && sortConfig?.direction === direction) {
            setSortConfig(null);
        } else {
            setSortConfig({ column, direction });
        }
    };

    // Selection
    const handleAllCheck = (currentData: T[]) => {
        if (selectedIds.length === currentData.length && currentData.length > 0) {
            setSelectedIds([]);
            setAllCheck(false);
        } else {
            setSelectedIds(currentData.map(d => d.id));
            setAllCheck(true);
        }
    };

    const handleRowSelect = (id: string, currentData: T[]) => {
        setSelectedIds(prev => {
            const isSelected = prev.includes(id);
            let next;
            if (isSelected) {
                next = prev.filter(pid => pid !== id);
                setAllCheck(false);
            } else {
                next = [...prev, id];
                if (next.length === currentData.length) {
                    setAllCheck(true);
                }
            }
            return next;
        });
    };

    // Column Management
    const handleColumnResize = (key: string, width: number) => {
        setColumnWidths(prev => ({ ...prev, [key]: width }));
    };

    const resetColumns = () => {
        setVisibleColumns(defaultVisibleColumns);
        setStickyColumns(
            columnsConfiguration.reduce((acc, col) => {
                if (col.sticky) acc[col.key] = true;
                return acc;
            }, {} as Record<string, boolean>)
        );
    };

    // Sync Column Order with Config changes (if new columns added)
    useEffect(() => {
        const stickyKeys: string[] = [];
        const nonStickyKeys: string[] = [];

        columnOrder.forEach((key) => {
            if (stickyColumns[key]) {
                stickyKeys.push(key);
            } else {
                nonStickyKeys.push(key);
            }
        });

        const configKeys = columnsConfiguration.map((c) => c.key);
        const currentKeys = new Set(columnOrder);
        const missingKeys = configKeys.filter((key) => !currentKeys.has(key));

        let newOrder = [...stickyKeys, ...nonStickyKeys];

        if (missingKeys.length > 0) {
            newOrder = [...newOrder, ...missingKeys];
            // Initialize visibility for new columns
            setVisibleColumns((prev) => {
                const next = { ...prev };
                let changed = false;
                missingKeys.forEach((key) => {
                    if (next[key] === undefined) {
                        next[key] = true;
                        changed = true;
                    }
                });
                return changed ? next : prev;
            });
        }

        if (JSON.stringify(newOrder) !== JSON.stringify(columnOrder)) {
            setColumnOrder(newOrder);
        }
    }, [stickyColumns, columnsConfiguration, columnOrder, setColumnOrder, setVisibleColumns]);


    return {
        // Search
        searchQuery,
        setSearchQuery,
        activeSearchQuery,
        setActiveSearchQuery,
        searchColumns,
        activeSearchColumns: Object.keys(searchColumns).filter(k => searchColumns[k]),
        isSearchFilterOpen,
        setIsSearchFilterOpen,
        handleSearchQueryChange,
        handleSearchSubmit,
        toggleSearchColumn,

        // Sort
        sortConfig,
        setSortConfig,
        handleSort,

        // Filter
        filters,
        setFilters,

        // Selection
        selectedIds,
        setSelectedIds,
        isAllCheck,
        setAllCheck,
        handleAllCheck,
        handleRowSelect,

        // Columns
        columnWidths,
        isColumnPopupOpen,
        setIsColumnPopupOpen,
        visibleColumns,
        setVisibleColumns,
        columnOrder,
        setColumnOrder,
        stickyColumns,
        setStickyColumns,
        handleColumnResize,
        resetColumns
    };
}
