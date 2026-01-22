"use client";

import clsx from "clsx";
import { ArrowLeft } from "lucide-react";

import { useMemo, useState, useEffect } from "react";
import ThemeHook from "@/hooks/ThemeHook";
import { DataTable } from "@/components/ui/table/DataTable";
import Modal from "@/components/ui/Modal";
import ListingForm from "@/components/ui/dashboard/listings/ListingForm";
import ListingsToolbar from "@/components/ui/dashboard/listings/ListingsToolbar";

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
    const [filters, setFilters] = useState<Record<string, string[]>>({});
    const [sortConfig, setSortConfig] = useState<{
        key: string;
        direction: "asc" | "desc";
    } | null>(null);

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
    }, [stickyColumns]);

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
        searchQuery,
        filters,
    });

    const { deleteListings, updateListing } = useListingMutations(agencyId);

    const listings = useMemo(() => {
        return listingsData?.pages.flatMap((page) => page.data) || [];
    }, [listingsData]);

    // handlers
    const handleGroupSelect = (address: string | null) => {
        setSelectedAddress(address);
        setSelectedListingIds([]);
    };

    const handleAddNew = (address?: string) => {
        setEditingListing(undefined);
        setTargetAddress(address);
        setIsSidePanelOpen(true);
    };

    const handleReset = () => {
        setSearchQuery("");
        setFilters({});
        setSortConfig(null);
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
        try {
            await updateListing.mutateAsync({
                id: rowId,
                [columnKey as keyof Listing]: value,
            });
        } catch (error) {
            console.error("Update failed", error);
            alert("수정 실패");
        }
    };

    const handleDelete = async () => {
        if (!selectedListingIds || selectedListingIds.length === 0) return;
        if (
            confirm(`${selectedListingIds.length}개의 항목을 삭제하시겠습니까?`)
        ) {
            try {
                await deleteListings.mutateAsync(selectedListingIds);
                setSelectedListingIds([]);
            } catch (error) {
                console.error("Delete failed", error);
                alert("삭제 중 오류가 발생했습니다.");
            }
        }
    };

    const handleSort = (key: string) => {
        setSortConfig((current) => {
            if (current?.key === key && current.direction === "asc") {
                return { key, direction: "desc" };
            }
            return { key, direction: "asc" };
        });
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
                    onAddNew={() => handleAddNew()}
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
                                    handleAddNew(selectedAddress);
                                }}
                                onToggleColumnPopup={() =>
                                    setIsColumnPopupOpen(!isColumnPopupOpen)
                                }
                                searchQuery={searchQuery}
                                onSearch={setSearchQuery}
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
                                    onClick={() => handleAddNew()}
                                >
                                    새 건물 등록하기
                                </button>
                            </>
                        ) : (
                            <>
                                <p>좌측 목록에서 주소(건물)를 선택하거나</p>
                                <button
                                    className="bg-(--background-surface) hover:bg-(--background-surface-hover) px-2 py-2 rounded-md border border-(--border)"
                                    onClick={() => handleAddNew()}
                                >
                                    새 건물 등록하기
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Overlays */}
            <Modal
                isOpen={isSidePanelOpen}
                onClose={() => setIsSidePanelOpen(false)}
                className="max-w-2xl"
            >
                <ListingForm
                    initialData={editingListing}
                    initialAddress={targetAddress}
                    onClose={() => setIsSidePanelOpen(false)}
                    agencyId={agencyId}
                />
            </Modal>
        </div>
    );
}
