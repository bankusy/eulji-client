"use client";

import clsx from "clsx";
import { ArrowLeft } from "lucide-react";

import { useMemo, useState, useEffect } from "react";
import ThemeHook from "@/hooks/ThemeHook";
import { DataTable } from "@/components/ui/table/DataTable";
import Modal from "@/components/ui/Modal";
import ListingForm from "@/components/features/listings/ListingForm";
import ListingsToolbar from "@/components/features/listings/ListingsToolbar";
import GlobalLoader from "@/components/ui/GlobalLoader";

import {
    useListingGroups,
    useListings,
    useListingMutations,
} from "@/hooks/queries/listings";
import { useDataTable } from "@/hooks/useDataTable";
import { Listing, listingColumns } from "@/types/listing";
import { ColumnVisibilityPopup } from "@/components/ui/table/ColumnsFilter";
import ListingGroupList from "@/components/features/listings/ListingGroupList";
import { Button } from "@/components/ui/Button";
import MenuBar from "@/components/ui/table/MenuBar";
import IconWrapper from "@/components/ui/IconWrapper";
import { useParams, useSearchParams } from "next/navigation";
import useLocalStorage from "@/hooks/useLocalStorage";
import { DashboardTableLayout } from "@/components/ui/table/DashboardTableLayout";

export default function ListingsPage() {
    const { systemTheme, isThemeReady } = ThemeHook();
    const params = useParams();
    const searchParams = useSearchParams();
    const agencyId = params.agencyId as string;

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
        selectedIds: selectedListingIds,
        setSelectedIds: setSelectedListingIds,
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
    } = useDataTable<Listing>({
        storageKeyPrefix: "listings",
        defaultVisibleColumns: useMemo(() => {
             return listingColumns.reduce((acc, col) => ({ ...acc, [col.key]: true }), {});
        }, []),
        defaultSearchColumns: {
            name: true,
            address_detail: true,
            owner_contact: true,
            memo: true,
        },
        defaultSort: { column: "created_at", direction: "desc" },
        columnsConfiguration: listingColumns.map(c => ({ key: c.key, sticky: c.sticky }))
    });

    const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
    const [editingListing, setEditingListing] = useState<Listing | undefined>(undefined);
    const [targetAddress, setTargetAddress] = useState<string | undefined>(undefined);
    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
    
    // Additional Page State
    const [newlyCreatedId, setNewlyCreatedId] = useState<string | null>(null);
    const [tempListing, setTempListing] = useState<Listing | null>(null);
    const [isNewBuildingModalOpen, setIsNewBuildingModalOpen] = useState(false);

    const getSearchLabel = (key: string) => {
        switch (key) {
            case "name": return "건물명";
            case "address_detail": return "상세 주소";
            case "owner_contact": return "연락처";
            case "memo": return "메모";
            default: return key;
        }
    };

    // Sync URL param with state
    useEffect(() => {
        const addressParam = searchParams.get("address");
        if (addressParam) {
            setSelectedAddress(addressParam);
        }
    }, [searchParams]);

    const { data: groups = [], isLoading: isGroupsLoading } =
        useListingGroups(agencyId);

    const {
        data: listingsData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: isListingsLoading,
    } = useListings({
        agencyId,
        address: selectedAddress,
        sortConfig: sortConfig ? { key: sortConfig.column, direction: sortConfig.direction } : null,
        searchQuery: activeSearchQuery,
        searchColumns: activeSearchColumns,
        filters,
    });

    const { deleteListings, updateListing, createListing } = useListingMutations(agencyId);

    const listings = useMemo(() => {
        const data = listingsData?.pages.flatMap((page) => page.data) || [];
        if (tempListing) {
            // Optimistic update might have added the item to data already
            const exists = data.some((item) => item.id === tempListing.id);
            if (exists) return data;
            return [tempListing, ...data];
        }
        return data;
    }, [listingsData, tempListing]);

    // handlers
    const handleGroupSelect = (address: string | null) => {
        setSelectedAddress(address);
        setSelectedListingIds([]);
    };

    const handleCreateEmptyRow = async (address?: string) => {
        const newId = crypto.randomUUID();
        const now = new Date().toISOString();

        const currentGroup = groups.find(g => g.address === address);

        const emptyListing: Listing = {
            id: newId,
            agency_id: agencyId,
            assigned_user_id: "", 
            name: currentGroup?.name || "신규 매물",
            address: address || "새 건물",
            address_detail: "",
            property_type: "OFFICETEL", // Default
            transaction_type: "WOLSE", // Default
            deposit: 0,
            rent: 0,
            status: "AVAILABLE",
            created_at: now,
            updated_at: now,
        };

        setTempListing(emptyListing);
        setNewlyCreatedId(newId);
        setTimeout(() => setNewlyCreatedId(null), 2000); // Highlight duration
    };

    const handleAddNew = (address?: string) => {
        // Legacy modal open - keeping for reference if needed, but we want inline creation now
        // But the toolbar calls onOpenAddPanel.
        // We will repurpose this or create a new handler.
        // The requirement is "like leads page" which adds a row directly.
        
        // If we want to support both (maybe from different buttons), we can keep this.
        // But for the main toolbar "Add" button:
        handleCreateEmptyRow(address);
    };

    const handleReset = () => {
        setSearchQuery("");
        setActiveSearchQuery("");
        setFilters({});
        // Use the proper setter if you want to reset, or maybe provide a reset capability in the hook
        handleSort("created_at", "desc");
    };

    const handleRowClick = (listing: Listing) => {
        setEditingListing(listing);
        setTargetAddress(listing.address);
        setIsSidePanelOpen(true);
    };

    const handleCellUpdate = async (rowId: string, columnKey: string, value: any) => {
        // If updating the temp listing, we create it first
        if (tempListing && rowId === tempListing.id) {
            let updates: any = { ...tempListing };

            if (columnKey === "price" && typeof value === "object") {
                if ("selling" in value) updates.price_selling = value.selling;
                if ("deposit" in value) updates.deposit = value.deposit;
                if ("rent" in value) updates.rent = value.rent;
            } else if (columnKey === "area" && typeof value === "object") {
                updates.area_supply_m2 = value.supply;
                updates.area_private_m2 = value.private;
            } else if (columnKey === "floor" && typeof value === "object") {
                updates.floor = value.floor;
                updates.total_floors = value.total;
            } else {
                updates[columnKey] = value;
            }

            try {
                await createListing.mutateAsync(updates);
                setTempListing(null); // Clear temp, now it's in the server data (optimistically or after refetch)
            } catch (error) {
                console.error("Failed to create listing on first edit", error);
                alert("등록 실패");
            }
            return;
        }

        // For existing listings: optimistic update (UI updates immediately)
        let updates: any = { id: rowId };

        if (columnKey === "price" && typeof value === "object") {
            if ("selling" in value) updates.price_selling = value.selling;
            if ("deposit" in value) updates.deposit = value.deposit;
            if ("rent" in value) updates.rent = value.rent;
        } else if (columnKey === "area" && typeof value === "object") {
            updates.area_supply_m2 = value.supply;
            updates.area_private_m2 = value.private;
        } else if (columnKey === "floor" && typeof value === "object") {
            updates.floor = value.floor;
            updates.total_floors = value.total;
        } else {
            updates[columnKey] = value;
        }

        // Use mutate instead of mutateAsync for optimistic updates
        // This will update the UI immediately via onMutate, then call the API
        updateListing.mutate(updates, {
            onError: (error) => {
                console.error("Update failed", error);
                alert("수정 실패");
            }
        });
    };

    const handleDelete = async () => {
        if (!selectedListingIds || selectedListingIds.length === 0) return;
        if (
            confirm(`${selectedListingIds.length}개의 항목을 삭제하시겠습니까?`)
        ) {
            try {
                await deleteListings.mutateAsync(selectedListingIds);
                setSelectedListingIds([]);
                
                // If all listings in the current view are deleted, reset the view
                // We check if (listings.length - deleted count) <= 0
                // Note: listings array might not be updated immediately in this event loop if it depends on refetch,
                // but deleteListings.mutateAsync usually triggers refetch or optimistic update.
                // A safer check is to wait for effect or check logically.
                // If we selected everything, and deleted everything.
                if (selectedListingIds.length === listings.length) {
                     setSelectedAddress(null);
                }
            } catch (error) {
                console.error("Delete failed", error);
                alert("삭제 중 오류가 발생했습니다.");
            }
        }
    };



    const visibleColumnConfig = useMemo(() => {
        const mergeSticky = (c: (typeof listingColumns)[0]) => ({
            ...c,
            sticky: stickyColumns[c.key] ?? c.sticky ?? false,
            // HACK: Force editable true for specific columns to fail-safe against stale imports
            editable: c.editable || ['address_detail', 'status', 'transaction_type', 'property_type'].includes(c.key),
        });

        const cols = listingColumns.filter((c) => visibleColumns[c.key]);
        return cols.map(mergeSticky).sort((a, b) => {
            const indexA = columnOrder.indexOf(a.key);
            const indexB = columnOrder.indexOf(b.key);
            return indexA - indexB;
        });
    }, [visibleColumns, columnOrder, stickyColumns]);

    return (
        <div className="flex h-full w-full relative gap-2">
            {/* {(isGroupsLoading || isListingsLoading) && <GlobalLoader />} */}
            {(isGroupsLoading) && <GlobalLoader />}
            {/* Left: Groups */}
            <div 
                className={clsx(
                    "relative w-full md:w-[300px] h-full shrink-0",
                    selectedAddress ? "hidden md:block" : "block"
                )}
            >
                <ListingGroupList
                    groups={groups}
                    selectedAddress={selectedAddress}
                    onSelect={handleGroupSelect}
                    isLoading={isGroupsLoading}
                    onAddNew={() => setIsNewBuildingModalOpen(true)}
                />
            </div>

            {/* Right: Listings */}
            <div 
                className={clsx(
                    "flex-1 flex flex-col w-full bg-(--background) h-full min-w-0",
                    !selectedAddress ? "hidden md:flex" : "flex"
                )}
            >
                {selectedAddress && (
                    <DashboardTableLayout
                        toolbar={
                            <div className="flex flex-col w-full gap-2">
                                {/* Mobile Back Button & Header */}
                                <div className="flex md:hidden w-full items-center gap-2 mb-1">
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="p-0 h-auto hover:bg-transparent"
                                        onClick={() => setSelectedAddress(null)}
                                    >
                                        <div className="flex items-center gap-1 text-(--foreground-muted)">
                                            <ArrowLeft size={16} />
                                            <span>목록으로</span>
                                        </div>
                                    </Button>
                                </div>

                                <div className="flex flex-col gap-2 items-end w-full mb-2">
                                    {/* Tools for this view */}
                                    <ListingsToolbar
                                        className="w-full"
                                        onOpenAddPanel={() => {
                                            if (selectedAddress) {
                                                handleCreateEmptyRow(selectedAddress);
                                            } else {
                                                setIsNewBuildingModalOpen(true);
                                            }
                                        }}
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
                                        onSearch={setSearchQuery}
                                        onSearchSubmit={() => setActiveSearchQuery(searchQuery)}
                                        getSearchLabel={getSearchLabel}
                                        placeholder="매물 내 검색"
                                        onReset={handleReset}
                                    />
                                    <div className="flex gap-2 items-center">
                                        <h2 className="text-xs font-semibold truncate">
                                            {selectedAddress}
                                        </h2>
                                        <p className="text-xs text-(--foreground-muted)">
                                            총 {listings.length}개의 매물
                                        </p>
                                    </div>
                                </div>
                            </div>
                        }
                        columnVisibilityPopup={
                            <ColumnVisibilityPopup
                                className={isColumnPopupOpen ? "mb-2" : ""}
                                isOpen={isColumnPopupOpen}
                                columnLabels={listingColumns.reduce(
                                    (acc, col) => ({ ...acc, [col.key]: col.name }),
                                    {},
                                )}
                                visibleColumns={visibleColumns}
                                setVisibleColumns={setVisibleColumns}
                                stickyColumns={stickyColumns}
                                setStickyColumns={setStickyColumns}
                                defaultColumns={listingColumns.map((c) => c.key)}
                                onReset={() => {
                                    const initialVisible: Record<string, boolean> =
                                        {};
                                    const initialSticky: Record<string, boolean> =
                                        {};
                                    listingColumns.forEach((col) => {
                                        initialVisible[col.key] = true;
                                        if (col.sticky)
                                            initialSticky[col.key] = true;
                                    });
                                    setVisibleColumns(initialVisible);
                                    setStickyColumns(initialSticky);
                                }}
                            />
                        }
                        menuBar={
                            <MenuBar
                                isOpen={selectedListingIds.length > 0}
                            >
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="font-semibold text-(--primary)">
                                        {selectedListingIds.length}
                                    </span>
                                    <span className="text-(--foreground-muted)">
                                        개 선택됨
                                    </span>
                                </div>
                                <div className="w-px h-4 bg-(--border) mx-2"></div>
                                <IconWrapper
                                    src={`/icons/delete/${systemTheme}.svg`}
                                    onClick={handleDelete}
                                    isVisibleDescription={true}
                                    description="삭제"
                                ></IconWrapper>
                            </MenuBar>
                        }
                        table={
                            <DataTable
                                data={listings}
                                columns={visibleColumnConfig as any}
                                columnWidths={columnWidths}
                                isEditing={false}
                                allCheck={
                                    listings.length > 0 &&
                                    selectedListingIds.length === listings.length
                                }
                                selectedIds={selectedListingIds}
                                onColumnResize={handleColumnResize}
                                onAllCheck={() => handleAllCheck(listings)}
                                onRowSelect={(id) => handleRowSelect(id, listings)}
                                onRowClick={handleRowClick}
                                onSort={handleSort}
                                sortConfig={sortConfig ? { key: sortConfig.column, direction: sortConfig.direction } : null}
                                filters={filters}
                                onFilterChange={(columnKey, values) => {
                                    setFilters((prev) => ({
                                        ...prev,
                                        [columnKey]: values,
                                    }));
                                }}
                                onColumnReorder={setColumnOrder}
                                onLoadMore={() => fetchNextPage()}
                                hasMore={!!hasNextPage}
                                isLoading={isFetchingNextPage}
                                isInitialLoading={isListingsLoading}
                                onCellUpdate={handleCellUpdate}
                                newlyCreatedId={newlyCreatedId}
                            />
                        }
                    />
                )}
                {!selectedAddress && !isGroupsLoading && (
                    <div className="flex flex-col items-center justify-center w-full h-full text-(--foreground-muted) text-sm gap-4 text-center">
                        {groups.length === 0 ? (
                            <>
                                <p>
                                    등록된 건물이 없습니다.
                                    <br />
                                    좌측 상단의 + 버튼을 클릭해서 새 매물을
                                    등록하세요.
                                </p>
                                <button
                                    className="bg-(--background-surface) hover:bg-(--background-surface-hover) px-3 py-2  border border-(--border)"
                                    onClick={() => setIsNewBuildingModalOpen(true)}
                                >
                                    새 건물 등록하기
                                </button>
                            </>
                        ) : (
                            <>
                                <p>좌측 목록에서 주소(건물)를 선택하거나</p>
                                <button
                                    className="bg-(--background-surface) hover:bg-(--background-surface-hover) px-2 py-2  border border-(--border)"
                                    onClick={() => setIsNewBuildingModalOpen(true)}
                                >
                                    새 건물 등록하기
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>

            <Modal
                isOpen={isNewBuildingModalOpen}
                onClose={() => setIsNewBuildingModalOpen(false)}
                className="max-w-xl"
            >
                <ListingForm
                    onClose={() => setIsNewBuildingModalOpen(false)}
                    agencyId={agencyId}
                />
            </Modal>
        </div>
    );
}
