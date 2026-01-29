"use client";

import ThemeHook from "@/hooks/ThemeHook";
import { leadColumns, Lead } from "@/types/lead";
import "@/styles/table.css";
import "@/styles/dashboard.css";
import { useState, useMemo } from "react";
import { ColumnVisibilityPopup } from "@/components/ui/table/ColumnsFilter";
import { DataTable } from "@/components/ui/table/DataTable";
import IconWrapper from "@/components/ui/IconWrapper";
import Modal from "@/components/ui/Modal";
import LeadForm from "@/components/features/leads/LeadForm";
import MenuBar from "@/components/ui/table/MenuBar";
import { useLeadMutations, useLeads } from "@/hooks/queries/leads";
import LeadsToolbar from "@/components/features/leads/LeadsToolbar";
import { useDataTable } from "@/hooks/useDataTable";
import { getAgencyMembers } from "../actions";
import { getRecommendedListings } from "./actions";
import RecommendationListModal from "@/components/features/leads/RecommendationListModal"; // Import modal
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useUserStore } from "@/hooks/useUserStore";
import GlobalLoader from "@/components/ui/GlobalLoader";
import { DashboardTableLayout } from "@/components/ui/table/DashboardTableLayout";
import { useLeadsColumns } from "./useLeadsColumns";

interface LeadsClientPageProps {
    initialData: {
        data: Lead[];
        nextId: number | null;
        count: number;
    };
    agencyId: string;
}

export default function LeadsClientPage({
    initialData,
    agencyId,
}: LeadsClientPageProps) {
    const { systemTheme } = ThemeHook();

    // Params are passed as props now, but we can still use hook if needed or just use prop
    // const params = useParams();
    // const agencyId = params.agencyId as string;

    // --- DataTable Hook ---
    const {
        // Search
        searchQuery,
        setSearchQuery,
        activeSearchQuery,
        setActiveSearchQuery,
        searchColumns,
        activeSearchColumns,
        isSearchFilterOpen,
        setIsSearchFilterOpen,
        handleSearchQueryChange,
        handleSearchSubmit,
        toggleSearchColumn,

        // Sort
        sortConfig,
        handleSort,

        // Filter
        filters,
        setFilters,

        // Selection
        selectedIds: selectedLeadIds,
        setSelectedIds: setSelectedLeadIds,
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
        resetColumns,
        resetSort
    } = useDataTable<Lead>({
        storageKeyPrefix: "leads",
        defaultVisibleColumns: useMemo(() => {
             const initial: Record<string, boolean> = {};
             leadColumns.forEach((column) => { initial[column.key] = true; });
             return initial;
        }, []),
        defaultSearchColumns: {
            name: true,
            phone: true,
            email: true,
            source: true,
            message: true,
        },
        defaultSort: { column: "created_at", direction: "desc" },
        columnsConfiguration: leadColumns.map((column) => ({ key: column.key, sticky: column.sticky }))
    });
    
    // Additional Page State (Not covered by useDataTable)
    const [isAddPanelOpen, setIsAddPanelOpen] = useState(false);
    const [editingLead, setEditingLead] = useState<Lead | null>(null);
    const [tempLead, setTempLead] = useState<Lead | null>(null);
    const [newlyCreatedId, setNewlyCreatedId] = useState<string | null>(null);
    const [selectedLeadForReco, setSelectedLeadForReco] = useState<Lead | null>(null);

    const { user } = useUserStore();
    const queryClient = useQueryClient();

    // Fetch Role & Members
    const { data: agencyInfo } = useQuery({
        queryKey: ["agencyInfo", agencyId, user?.id],
        queryFn: async () => {
            if (!agencyId || !user?.id) return null;
            const supabase = createSupabaseBrowserClient();
            const { data: membership } = await supabase
                .from("agency_users")
                .select("role")
                .eq("agency_id", agencyId)
                .eq("user_id", user.id)
                .single();
            return { role: membership?.role };
        },
        enabled: !!agencyId && !!user?.id,
    });

    const { data: members = [] } = useQuery({
        queryKey: ["agencyMembers", agencyId],
        queryFn: () => getAgencyMembers(agencyId),
        enabled: !!agencyId,
    });

    const isOwner = agencyInfo?.role === "OWNER";

    // Data Fetching via React Query

    const {
        createLead: createLeadMutation,
        deleteLeads: deleteLeadsMutation,
        updateLead: updateLeadMutation,
    } = useLeadMutations(agencyId);

    // Debug filters
    console.log("LeadsClientPage: Current filters:", filters);

    const {
        data: leadsData,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useLeads({
        agencyId,
        query: activeSearchQuery,
        searchColumns: activeSearchColumns,
        sortColumn: sortConfig?.column || "created_at",
        sortDirection: sortConfig?.direction || "desc",
        filters,
        // Only use initialData when in default state (no search, no filters)
        // Otherwise, React Query will mistakenly use the unfiltered initialData for filtered keys
        // and suppress fetching due to staleTime.
        initialData: 
            (!activeSearchQuery && 
             (!filters || Object.keys(filters).length === 0) &&
             (!sortConfig || (sortConfig.column === "created_at" && sortConfig.direction === "desc"))
            )
            ? initialData 
            : undefined,
    });

    const leads = useMemo(() => {
        const allData = leadsData?.pages.flatMap((page) => page.data) || [];
        
        // Deduplicate by ID
        const uniqueDataMap = new Map();
        allData.forEach((item) => {
            if (!uniqueDataMap.has(item.id)) {
                uniqueDataMap.set(item.id, item);
            }
        });
        
        const uniqueList = Array.from(uniqueDataMap.values());

        if (tempLead) {
            const exists = uniqueDataMap.has(tempLead.id);
            if (!exists) {
                return [tempLead, ...uniqueList];
            }
        }
        return uniqueList;
    }, [leadsData, tempLead]);

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
            property_type: "OFFICETEL",
            transaction_type: "WOLSE",
            deposit_min: 0,
            deposit_max: 0,
            price_min: 0,
            price_max: 0,
            message: "",
            memo: "",
            source: "ETC",
            created_at: now,
            updated_at: now,
        };

        setTempLead(emptyLead);
        setNewlyCreatedId(newId);
        setTimeout(() => setNewlyCreatedId(null), 2000);
    };

    const handleCellUpdate = async (
        rowId: string,
        columnKey: string,
        value: any,
    ) => {
        // If updating the temp lead, create it first
        if (tempLead && rowId === tempLead.id) {
            let updatedLead: Lead = { ...tempLead };

            if (columnKey === "deposit" && typeof value === "object") {
                updatedLead = {
                    ...updatedLead,
                    deposit_min: value.min,
                    deposit_max: value.max,
                };
            } else if (columnKey === "price" && typeof value === "object") {
                updatedLead = {
                    ...updatedLead,
                    price_min: value.min,
                    price_max: value.max,
                };
            } else if (columnKey === "assignee") {
                updatedLead = {
                    ...updatedLead,
                    assigned_user_id: value,
                    assignee: members.find((m) => m.id === value)?.name || "",
                };
            } else {
                updatedLead = { ...updatedLead, [columnKey]: value };
            }

            try {
                const res = await createLeadMutation.mutateAsync(updatedLead);
                setTempLead(null); // Clear temp, now in server data

                // Async fetch recommendations
                if (
                    res?.data &&
                    Array.isArray(res.data) &&
                    res.data.length > 0
                ) {
                    const newLead = res.data[0];
                    getRecommendedListings(agencyId, newLead).then(
                        (recs: any[]) => {
                            // Update cache with recommendations
                            queryClient.setQueriesData(
                                { queryKey: ["leads"] },
                                (old: any) => {
                                    if (!old) return old;
                                    return {
                                        ...old,
                                        pages: old.pages.map((page: any) => ({
                                            ...page,
                                            data: page.data.map(
                                                (lead: Lead) => {
                                                    if (
                                                        lead.id === newLead.id
                                                    ) {
                                                        return {
                                                            ...lead,
                                                            recommendations:
                                                                recs,
                                                        };
                                                    }
                                                    return lead;
                                                },
                                            ),
                                        })),
                                    };
                                },
                            );
                        },
                    );
                }
            } catch (error) {
                console.error("Failed to create lead on first edit", error);
                alert("등록 실패");
            }
            return;
        }

        // For existing leads: optimistic update (UI updates immediately)
        const targetLead = leads.find((l) => l.id === rowId);
        if (!targetLead) return;

        let updatedLead: Lead;

        if (columnKey === "deposit" && typeof value === "object") {
            updatedLead = {
                ...targetLead,
                deposit_min: value.min,
                deposit_max: value.max,
            };
        } else if (columnKey === "price" && typeof value === "object") {
            updatedLead = {
                ...targetLead,
                price_min: value.min,
                price_max: value.max,
            };
        } else if (columnKey === "assignee") {
            updatedLead = {
                ...targetLead,
                assigned_user_id: value,
                assignee: members.find((m) => m.id === value)?.name || "",
            };
        } else {
            updatedLead = { ...targetLead, [columnKey]: value };
        }

        // Use mutate instead of mutateAsync for optimistic updates
        // This will update the UI immediately via onMutate, then call the API
        updateLeadMutation.mutate(updatedLead, {
            onError: (error) => {
                console.error("Update failed", error);
                alert("수정 실패");
            },
        });
    };

    // Sync changes from hook if needed or side effects. The hook handles syncing.


    // --- Column Configuration Refactoring ---
    const visibleColumnConfig = useLeadsColumns(
        columnOrder,
        visibleColumns,
        stickyColumns,
        members,
        isOwner,
        // 추천 매물 클릭 핸들러
        (lead: Lead) => setSelectedLeadForReco(lead)
    );

    const columnLabels = leadColumns.reduce(
        (accumulator, column) => {
            accumulator[column.key] = column.name;
            return accumulator;
        },
        {} as Record<string, string | React.ReactNode>,
    );

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
        <div className="h-full w-full relative">
            {/* {isLoading && <GlobalLoader />} */}
            <DashboardTableLayout
                toolbar={
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
                        onToggleSearchColumn={(key) => toggleSearchColumn(key)}
                        searchQuery={searchQuery}
                        onSearchQueryChange={setSearchQuery}
                        onSearchSubmit={() => setActiveSearchQuery(searchQuery)}
                        getSearchLabel={getSearchLabel}
                    />
                }
                columnVisibilityPopup={
                    <ColumnVisibilityPopup
                        className={isColumnPopupOpen ? "mb-2" : ""}
                        isOpen={isColumnPopupOpen}
                        columnLabels={columnLabels}
                        visibleColumns={visibleColumns}
                        setVisibleColumns={setVisibleColumns}
                        stickyColumns={stickyColumns}
                        setStickyColumns={setStickyColumns}
                        defaultColumns={leadColumns.map((column) => column.key)}
                        onReset={() => {
                            const initialVisible: Record<string, boolean> = {};
                            const initialSticky: Record<string, boolean> = {};
                            leadColumns.forEach((column) => {
                                initialVisible[column.key] = true;
                                if (column.sticky) initialSticky[column.key] = true;
                            });
                            setVisibleColumns(initialVisible);
                            setStickyColumns(initialSticky);
                        }}
                    />
                }
                menuBar={
                    <MenuBar isOpen={!!selectedLeadIds && selectedLeadIds.length > 0}>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="font-semibold text-(--primary)">
                                {selectedLeadIds?.length}
                            </span>
                            <span className="text-(--foreground-muted)">개 선택됨</span>
                        </div>
                        <div className="w-px h-4 bg-(--border) mx-2"></div>
                        <IconWrapper
                            className="border border-(--border-surface)"
                            src={`/icons/delete/${systemTheme}.svg`}
                            onClick={handleDelete}
                            isVisibleDescription={true}
                            description="삭제"
                        ></IconWrapper>
                    </MenuBar>
                }
                table={
                    <DataTable
                        data={leads}
                        columns={visibleColumnConfig}
                        columnWidths={columnWidths}
                        allCheck={
                            leads.length > 0 && selectedLeadIds?.length === leads.length
                        }
                        isEditing={false}
                        onColumnResize={handleColumnResize}
                        onAllCheck={() => handleAllCheck(leads)}
                        selectedIds={selectedLeadIds}
                        onRowSelect={(id) => handleRowSelect(id, leads)}
                        onRowClick={undefined}
                        onSort={handleSort}
                        sortConfig={sortConfig ? { key: sortConfig.column, direction: sortConfig.direction } : null}
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
                }
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

            <RecommendationListModal
                isOpen={!!selectedLeadForReco}
                onClose={() => setSelectedLeadForReco(null)}
                lead={selectedLeadForReco}
                agencyId={agencyId}
            />
        </div>
    );
}
