"use client";

import useLocalStorage from "@/hooks/useLocalStorage";
import Image from "next/image";
import ThemeHook from "@/hooks/ThemeHook";
import { columnsConfiguration, Lead } from "@/types/lead";
import clsx from "clsx";
import "@/styles/table.css";
import "@/styles/dashboard.css";
import { Dispatch, SetStateAction, useState, useMemo, useEffect } from "react";
import { ColumnVisibilityPopup } from "@/components/ui/table/ColumnsFilter";
import { DataTable } from "@/components/ui/table/DataTable";
import IconWrapper from "@/components/ui/IconWrapper";
import Modal from "@/components/ui/Modal";
import LeadForm from "@/components/ui/dashboard/leads/LeadForm";
import MenuBar from "@/components/ui/table/MenuBar";
import { useParams } from "next/navigation";
import { useLeadMutations, useLeads } from "@/hooks/queries/leads";
import LeadsToolbar from "@/components/ui/dashboard/leads/LeadsToolbar";

export default function Page() {
    const { systemTheme } = ThemeHook();
    const params = useParams();
    const agencyId = params.agencyId as string;

    const [selectedLeadIds, setSelectedLeadIds] = useState<string[] | null>([]);
    const [isAllCheck, setAllCheck] = useState(false);
    const [editingLead, setEditingLead] = useState<Lead | null>(null);
    const [columnWidths, setColumnWidths] = useLocalStorage<{ [key: string]: number }>(
        "leads_column_widths", {}
    );
    const [isColumnPopupOpen, setIsColumnPopupOpen] = useState(false);
    const [isAddPanelOpen, setIsAddPanelOpen] = useState(false);
    const [newlyCreatedId, setNewlyCreatedId] = useState<string | null>(null);
    const defaultVisibleColumns = useMemo(() => {
        const initial: Record<string, boolean> = {};
        columnsConfiguration.forEach((col) => {
            initial[col.key] = true;
        });
        return initial;
    }, []);

    const [visibleColumns, setVisibleColumns] = useLocalStorage<
        Record<string, boolean>
    >("leads_visible_columns", defaultVisibleColumns);

    // Search State
    const [searchQuery, setSearchQuery] = useState("");
    const [activeSearchQuery, setActiveSearchQuery] = useState("");
    const [searchColumns, setSearchColumns] = useLocalStorage<Record<string, boolean>>(
        "leads_search_columns",
        {
            name: true,
            phone: true,
            email: true,
            source: true,
            message: true,
        }
    );
    const [isSearchFilterOpen, setIsSearchFilterOpen] = useState(false);

    // Sort State
    const [sortConfig, setSortConfig] = useLocalStorage<{
        column: string;
        direction: "asc" | "desc";
    }>("leads_sort_config", {
        column: "created_at",
        direction: "desc",
    });

    // Filter State
    const [filters, setFilters] = useState<Record<string, string[]>>({});

    // Data Fetching via React Query
    const activeSearchColumns = Object.keys(searchColumns).filter(
        (k) => searchColumns[k]
    );

    const { createLead: createLeadMutation, deleteLeads: deleteLeadsMutation, updateLead: updateLeadMutation } = useLeadMutations(agencyId);
    const { 
        data: leadsData, 
        isLoading, 
        fetchNextPage, 
        hasNextPage, 
        isFetchingNextPage 
    } = useLeads({
        agencyId,
        query: activeSearchQuery,
        searchColumns: activeSearchColumns,
        sortColumn: sortConfig.column,
        sortDirection: sortConfig.direction,
        filters,
    });

    const leads = useMemo(() => {
        return leadsData?.pages.flatMap((page) => page.data) || [];
    }, [leadsData]);

    const handleCreateEmptyRow = async () => {
        const newId = crypto.randomUUID();
        const now = new Date().toISOString();
        
        const emptyLead: Lead = {
            id: newId,
            name: "신규 리드",
            phone: "",
            email: "",
            stage: "NEW",
            assignee: "",
            propertyType: "OFFICETEL",
            transactionType: "WOLSE",
            depositMin: 0,
            depositMax: 0,
            priceMin: 0,
            priceMax: 0,
            message: "",
            memo: "",
            source: "DIRECT",
            createdAt: now,
            updatedAt: now,
        };

        try {
            setNewlyCreatedId(newId);
            setTimeout(() => setNewlyCreatedId(null), 2000);
            await createLeadMutation.mutateAsync(emptyLead);
        } catch (error) {
            console.error("Failed to create empty row", error);
            alert("행 추가 실패");
        }
    };

    const handleCellUpdate = async (rowId: string, columnKey: string, value: any) => {
        const targetLead = leads.find((l) => l.id === rowId);
        if (!targetLead) return;

        let updatedLead: Lead;

        if (columnKey === "deposit" && typeof value === "object") {
            updatedLead = { 
                ...targetLead, 
                depositMin: value.min, 
                depositMax: value.max 
            };
        } else if (columnKey === "price" && typeof value === "object") {
            updatedLead = { 
                ...targetLead, 
                priceMin: value.min, 
                priceMax: value.max 
            };
        } else {
            updatedLead = { ...targetLead, [columnKey]: value };
        }

        try {
            await updateLeadMutation.mutateAsync(updatedLead);
        } catch (error) {
            console.error("Update failed", error);
            alert("수정 실패");
        }
    };

    const [columnOrder, setColumnOrder] = useLocalStorage<string[]>(
        "leads_column_order",
        columnsConfiguration.map((c) => c.key)
    );

    const [stickyColumns, setStickyColumns] = useLocalStorage<
        Record<string, boolean>
    >(
        "leads_sticky_columns",
        columnsConfiguration.reduce((acc, col) => {
            if (col.sticky) acc[col.key] = true;
            return acc;
        }, {} as Record<string, boolean>)
    );

    useEffect(() => {
        // Enforce sticky columns to be at the start
        const stickyKeys: string[] = [];
        const nonStickyKeys: string[] = [];
        
        columnOrder.forEach(key => {
            if (stickyColumns[key]) {
                stickyKeys.push(key);
            } else {
                nonStickyKeys.push(key);
            }
        });

        // Also handle any missing keys from config if needed, but columnOrder usually has all
        
        const newOrder = [...stickyKeys, ...nonStickyKeys];
        
        if (JSON.stringify(newOrder) !== JSON.stringify(columnOrder)) {
            setColumnOrder(newOrder);
        }
    }, [stickyColumns]); // Depend primarily on stickyColumns changes

    const visibleColumnConfig = useMemo(() => {
        const colMap = new Map(columnsConfiguration.map((c) => [c.key, c]));
        
        // Helper to merge sticky state
        const mergeSticky = (c: typeof columnsConfiguration[0]) => ({
            ...c,
            sticky: stickyColumns[c.key] ?? c.sticky ?? false,
        });

        const ordered = columnOrder
            .map((key) => colMap.get(key))
            .filter((c) => c && visibleColumns[c.key])
            .map((c) => mergeSticky(c!));
        
        const missing = columnsConfiguration
            .filter(c => !columnOrder.includes(c.key) && visibleColumns[c.key])
            .map(mergeSticky);
        
        return [...ordered, ...missing] as typeof columnsConfiguration;
    }, [columnOrder, visibleColumns, stickyColumns]);

    const columnLabels = columnsConfiguration.reduce((acc, col) => {
        acc[col.key] = col.name;
        return acc;
    }, {} as Record<string, string>);

    // Helper for search column labels
    const getSearchLabel = (key: string) => {
        switch (key) {
            case "name":
                return "이름";
            case "phone":
                return "휴대폰";
            case "email":
                return "이메일";
            case "source":
                return "유입 경로";
            case "message":
                return "문의 내용";
            default: 
                return key;
        }
    };

    const handleColumnResize = (key: string, newWidth: number) => {
        setColumnWidths((prev) => ({
            ...prev,
            [key]: newWidth,
        }));
    };

    const handleDelete = async () => {
        if (!selectedLeadIds || selectedLeadIds.length === 0) return;
        if (confirm(`${selectedLeadIds.length}개의 항목을 삭제하시겠습니까?`)) {
            try {
                await deleteLeadsMutation.mutateAsync(selectedLeadIds);
                setSelectedLeadIds([]);
                setAllCheck(false);
            } catch (error) {
                console.error("Delete failed", error);
                alert("삭제 중 오류가 발생했습니다.");
            }
        }
    };

    return (
        <div className="flex flex-col w-full h-full">
            <LeadsToolbar
                onOpenAddPanel={handleCreateEmptyRow}
                onToggleColumnPopup={() =>
                    setIsColumnPopupOpen(!isColumnPopupOpen)
                }
                isSearchFilterOpen={isSearchFilterOpen}
                onToggleSearchFilter={() =>
                    setIsSearchFilterOpen(!isSearchFilterOpen)
                }
                searchColumns={searchColumns}
                onToggleSearchColumn={(key) =>
                    setSearchColumns((prev) => ({
                        ...prev,
                        [key]: !prev[key],
                    }))
                }
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
                onSearchSubmit={() => setActiveSearchQuery(searchQuery)}
                getSearchLabel={getSearchLabel}
            />

            <ColumnVisibilityPopup
                className={`${isColumnPopupOpen ? "mb-2" : ""}`}
                isOpen={isColumnPopupOpen}
                columnLabels={columnLabels}
                visibleColumns={visibleColumns}
                setVisibleColumns={setVisibleColumns}
                stickyColumns={stickyColumns}
                setStickyColumns={setStickyColumns}
                defaultColumns={columnsConfiguration.map((c) => c.key)}
                onReset={() => {
                    const initialVisible: Record<string, boolean> = {};
                    const initialSticky: Record<string, boolean> = {};
                    columnsConfiguration.forEach((col) => {
                        initialVisible[col.key] = true;
                        if (col.sticky) initialSticky[col.key] = true;
                    });
                    setVisibleColumns(initialVisible);
                    setStickyColumns(initialSticky);
                }}
            />

            <MenuBar isOpen={!!selectedLeadIds && selectedLeadIds.length > 0}>
                <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold text-(--primary)">
                        {selectedLeadIds?.length}
                    </span>
                    <span className="text-(--foreground-muted)">개 선택됨</span>
                </div>
                <div className="w-px h-4 bg-(--border) mx-2"></div>
                <IconWrapper
                    src={`/icons/delete/${systemTheme}.svg`}
                    onClick={handleDelete}
                ></IconWrapper>
            </MenuBar>
            <DataTable
                data={leads}
                columns={visibleColumnConfig}
                columnWidths={columnWidths}
                allCheck={
                    leads.length > 0 && selectedLeadIds?.length === leads.length
                }
                isEditing={false}
                onColumnResize={handleColumnResize}
                onAllCheck={() => {
                    if (selectedLeadIds?.length === leads.length) {
                        setSelectedLeadIds([]);
                        setAllCheck(false);
                    } else {
                        setSelectedLeadIds(leads.map((d) => d.id));
                        setAllCheck(true);
                    }
                }}
                selectedIds={selectedLeadIds}
                onRowSelect={(id) => {
                    setSelectedLeadIds((prev) => {
                        const safetyPrev = prev || [];
                        const isSelected = safetyPrev.includes(id);
                        if (isSelected) {
                            const next = safetyPrev.filter((pid) => pid !== id);
                            setAllCheck(false);
                            return next;
                        } else {
                            const next = [...safetyPrev, id];
                            if (next.length === leads.length) {
                                setAllCheck(true);
                            }
                            return next;
                        }
                    });
                }}
                onRowClick={undefined}
                onSort={(column, direction) => {
                    setSortConfig({ column, direction });
                }}
                sortConfig={{ key: sortConfig.column, direction: sortConfig.direction }}
                filters={filters}
                onFilterChange={(columnKey, values) => {
                    setFilters((prev) => ({ ...prev, [columnKey]: values }));
                }}
                onColumnReorder={setColumnOrder}
                onLoadMore={() => fetchNextPage()}
                hasMore={!!hasNextPage}
                isLoading={isFetchingNextPage}
                isInitialLoading={isLoading}
                onCellUpdate={handleCellUpdate}
                newlyCreatedId={newlyCreatedId}
            />
            <Modal
                isOpen={isAddPanelOpen}
                onClose={() => {
                    setIsAddPanelOpen(false);
                    setEditingLead(null);
                }}
                className="max-w-2xl"
            >
                <LeadForm
                    key={editingLead?.id || "new"} // Force re-render on change
                    initialData={editingLead}
                    agencyId={agencyId}
                    onClose={() => {
                        setIsAddPanelOpen(false);
                        setEditingLead(null);
                    }}
                />
            </Modal>
        </div>
    );
}
