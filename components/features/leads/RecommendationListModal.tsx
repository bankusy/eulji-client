"use client";

import React, { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Lead } from "@/types/lead";
import { Listing } from "@/types/listing";
import { saveLeadListing, getRecommendedListings } from "@/app/dashboard/agencies/[agencyId]/leads/actions";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Send } from "lucide-react";
import Image from "next/image";

interface RecommendationListModalProps {
    isOpen: boolean;
    onClose: () => void;
    lead: Lead | null;
    agencyId: string;
}

export default function RecommendationListModal({
    isOpen,
    onClose,
    lead,
    agencyId,
}: RecommendationListModalProps) {
    const queryClient = useQueryClient();
    const [proposedIds, setProposedIds] = useState<Set<string>>(new Set());

    // Fetch detailed recommendations when modal is open
    const { data: recommendations, isLoading } = useQuery({
        queryKey: ["recommendations", lead?.id, agencyId],
        queryFn: () => (lead ? getRecommendedListings(agencyId, lead) : Promise.resolve([])),
        enabled: isOpen && !!lead,
        staleTime: 1000 * 60 * 2, // 2 minutes short cache
    });

    if (!lead || !lead.recommendations) return null;

    const displayList = recommendations && recommendations.length > 0 ? recommendations : (lead.recommendations || []);
    // Note: if lead.recommendations only has IDs, we might fallback to empty, but useQuery should be fast.
    // Actually, if we are in minimal mode, lead.recommendations has [{id: ...}], so we need to be careful not to render that as full listing.
    // Let's rely on isLoading for the switch or check if properties exist.
    
    // Improved logic:
    // If we have full data from useQuery, use it.
    // If not, and we are loading, show loader.
    // If not loading and no data, show empty.

    const hasFullData = (list: any[] | undefined) => !!list && list.length > 0 && !!list[0].property_type;
    const finalRecommendations = hasFullData(recommendations) ? recommendations! : [];

    console.log("[RecommendationListModal] finalRecommendations:", finalRecommendations.length, "Source recs:", recommendations?.length);

    const handlePropose = async (listingId: string) => {
        try {
            const res = await saveLeadListing(agencyId, lead.id, listingId);
            if (res.success) {
                setProposedIds((prev) => new Set(prev).add(listingId));
            } else {
                alert(res.message || "추천 실패");
            }
        } catch (error) {
            console.error(error);
            alert("오류가 발생했습니다.");
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            className="max-w-3xl w-full h-[80vh] flex flex-col"
        >
            <div className="flex-none p-6 border-b border-(--border)">
                <h2 className="text-xl font-semibold">추천 매물 목록</h2>
                <p className="text-sm text-(--foreground-muted) mt-1">
                    {lead.name}님에게 적합한 매물이 {finalRecommendations.length > 0 ? finalRecommendations.length : (lead.recommendations?.length || 0)}건 있습니다.
                </p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {isLoading && finalRecommendations.length === 0 ? (
                    <div className="flex justify-center py-12">
                         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : finalRecommendations.length === 0 ? (
                    <div className="text-center py-12 text-(--foreground-muted)">
                        추천할 매물이 없습니다.
                    </div>
                ) : (
                    finalRecommendations.map((listing: any) => {
                        const isProposed = proposedIds.has(listing.id);

                        return (
                            <div
                                key={listing.id}
                                className="relative flex gap-4 p-4 border border-(--border-surface) rounded-lg hover:bg-(--background-subtle) transition-colors"
                            >


                                {/* Info */}
                                    <Button
                                        size="sm"
                                        variant={isProposed ? "outline" : "primary"}
                                        disabled={isProposed}
                                        onClick={() => handlePropose(listing.id)}
                                        className="absolute top-4 right-4"
                                    >
                                        {isProposed ? (
                                            <>
                                                <Check className="w-4 h-4 mr-1.5" />
                                                제안됨
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4 mr-1.5" />
                                                제안하기
                                            </>
                                        )}
                                    </Button>

                                    <div className="flex-1 min-w-0 pr-24">
                                        <div className="flex flex-col">
                                            <div>
                                                <div className="font-medium text-lg leading-tight mb-1 truncate">
                                                    {listing.property_type === "OFFICETEL" ? "오피스텔" : 
                                                     listing.property_type === "APARTMENT" ? "아파트" : listing.property_type}
                                                    {" · "}
                                                    {listing.transaction_type === "WOLSE" ? "월세" : 
                                                     listing.transaction_type === "JEONSE" ? "전세" : "매매"}
                                                </div>
                                                <div className="text-xl font-bold text-(--primary) mb-2">
                                                    {listing.transaction_type === "WOLSE" 
                                                        ? `${listing.deposit}/${listing.rent}`
                                                        : listing.transaction_type === "JEONSE" 
                                                        ? listing.deposit 
                                                        : listing.price_selling}
                                                    <span className="text-sm font-normal text-(--foreground-muted) ml-1">만원</span>
                                                </div>
                                                <div className="text-sm text-(--foreground-muted) truncate">
                                                    {listing.address} {listing.address_detail}
                                                </div>
                                            </div>
                                        </div>
                                    <div className="mt-3 flex gap-2">
                                        <div className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs text-gray-600 dark:text-gray-400">
                                            {listing.room_count}룸
                                        </div>
                                        <div className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs text-gray-600 dark:text-gray-400">
                                            {listing.area_private_m2}m²
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="flex-none p-4 border-t border-(--border) flex justify-end">
                <Button variant="ghost" onClick={onClose}>
                    닫기
                </Button>
            </div>
        </Modal>
    );
}
