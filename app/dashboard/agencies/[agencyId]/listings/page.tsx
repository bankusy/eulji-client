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

import { Listing, listingColumns } from "@/types/listing";
import { ColumnVisibilityPopup } from "@/components/ui/table/ColumnsFilter";
import ListingGroupList from "@/components/features/listings/ListingGroupList";
import { Button } from "@/components/ui/Button";
import MenuBar from "@/components/ui/table/MenuBar";
import IconWrapper from "@/components/ui/IconWrapper";
import { useParams } from "next/navigation";
import useLocalStorage from "@/hooks/useLocalStorage";

export default function ListingsPage() {
    const { systemTheme, isThemeReady } = ThemeHook();
    const params = useParams();
    const agencyId = params.agencyId as string;

    const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
    const [selectedListingIds, setSelectedListingIds] = useState<string[]>([]);
    const [editingListing, setEditingListing] = useState<Listing | undefined>(
        undefined,
    );
    const [targetAddress, setTargetAddress] = useState<string | undefined>(
        undefined,
    );
    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

    const [searchQuery, setSearchQuery] = useState("");
    const [activeSearchQuery, setActiveSearchQuery] = useState("");
    const [isSearchFilterOpen, setIsSearchFilterOpen] = useState(false);

    const [searchColumns, setSearchColumns] = useLocalStorage<Record<string, boolean>>(
        "listings_search_columns",
        {
            name: true,
            address_detail: true,
            owner_contact: true,
            memo: true,
        }
    );
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

    const activeSearchColumns = useMemo(() => {
        return Object.keys(searchColumns).filter((k) => searchColumns[k]);
    }, [searchColumns]);

    // Sort State
    const [sortConfig, setSortConfig] = useLocalStorage<{
        key: string;
        direction: "asc" | "desc";
    } | null>("listings_sort_config", {
        key: "created_at",
        direction: "desc",
    });

    const [filters, setFilters] = useState<Record<string, string[]>>({});

    const [columnWidths, setColumnWidths] = useState<Record<string, number>>(
        {},
    );
    const [isColumnPopupOpen, setIsColumnPopupOpen] = useState(false);
    const [visibleColumns, setVisibleColumns] = useLocalStorage<
        Record<string, boolean>
    >(
        "listings_visible_columns",
        listingColumns.reduce((acc, col) => ({ ...acc, [col.key]: true }), {}),
    );

    const [columnOrder, setColumnOrder] = useState<string[]>(
        listingColumns.map((c) => c.key),
    );

    // Sticky Columns State
    const [stickyColumns, setStickyColumns] = useLocalStorage<
        Record<string, boolean>
    >(
        "listings_sticky_columns",
        listingColumns.reduce(
            (acc, col) => {
                if (col.sticky) acc[col.key] = true;
                return acc;
            },
            {} as Record<string, boolean>,
        ),
    );

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

        const newOrder = [...stickyKeys, ...nonStickyKeys];

        if (JSON.stringify(newOrder) !== JSON.stringify(columnOrder)) {
            setColumnOrder(newOrder);
        }
    }, [stickyColumns, columnOrder]);

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
        sortConfig,
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

        const emptyListing: Listing = {
            id: newId,
            agency_id: agencyId,
            assigned_user_id: "", // TODO: Set to current user if needed, or leave empty
            name: "신규 매물",
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
        setSortConfig({
            key: "created_at",
            direction: "desc",
        });
    };

    const handleColumnResize = (key: string, width: number) => {
        setColumnWidths((prev) => ({ ...prev, [key]: width }));
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

    const handleSort = (key: string, direction: "asc" | "desc") => {
        // direction이 이미 선택된 것과 같으면 정렬 해제
        if (sortConfig?.key === key && sortConfig?.direction === direction) {
            setSortConfig(null);
        } else {
            setSortConfig({ key, direction });
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
            {(isGroupsLoading || isListingsLoading) && <GlobalLoader />}
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
                    <div className="flex flex-col w-full h-full min-w-0">
                        <div className="flex flex-col gap-2 items-end bg-(--background) mb-2">
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

                            {/* Tools for this view */}
                            <ListingsToolbar
                                className="flex-1"
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
                                onToggleSearchColumn={(key) =>
                                    setSearchColumns((prev) => ({
                                        ...prev,
                                        [key]: !prev[key],
                                    }))
                                }
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

                        <MenuBar
                            isOpen={selectedListingIds.length > 0}
                            className={
                                selectedListingIds.length > 0 ? "mb-2" : ""
                            }
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

                        {/* Table */}
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
                            onAllCheck={() => {
                                if (
                                    selectedListingIds.length ===
                                    listings.length
                                ) {
                                    setSelectedListingIds([]);
                                } else {
                                    setSelectedListingIds(
                                        listings.map((l) => l.id),
                                    );
                                }
                            }}
                            onRowSelect={(id) => {
                                setSelectedListingIds((prev) =>
                                    prev.includes(id)
                                        ? prev.filter((x) => x !== id)
                                        : [...prev, id],
                                );
                            }}
                            onRowClick={handleRowClick}
                            onSort={handleSort}
                            sortConfig={sortConfig}
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
                    </div>
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
                                    className="bg-(--background-surface) hover:bg-(--background-surface-hover) px-3 py-2 rounded-md border border-(--border)"
                                    onClick={() => setIsNewBuildingModalOpen(true)}
                                >
                                    새 건물 등록하기
                                </button>
                            </>
                        ) : (
                            <>
                                <p>좌측 목록에서 주소(건물)를 선택하거나</p>
                                <button
                                    className="bg-(--background-surface) hover:bg-(--background-surface-hover) px-2 py-2 rounded-md border border-(--border)"
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
