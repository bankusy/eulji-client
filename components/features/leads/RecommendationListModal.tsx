"use client";

import React, { useState } from "react";
import Modal from "@/components/ui/v1/Modal";
import {Button} from "@/components/ui/v1/Button";
import { Lead } from "@/types/lead";
import { Listing } from "@/types/listing";
import { saveLeadListing, getRecommendedListings, getProposedListings } from "@/app/dashboard/agencies/[agencyId]/leads/actions";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Send } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

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
    const router = useRouter();
    const [proposedListingIds, setProposedListingIds] = useState<Set<string>>(new Set());
    const [isLoadingProposals, setIsLoadingProposals] = useState(false);

    // Fetch proposed listings
    React.useEffect(() => {
        if (isOpen && lead && agencyId) {
            setIsLoadingProposals(true);
            getProposedListings(agencyId, lead.id)
                .then(data => {
                    const ids = new Set(data?.map((item: any) => item.listing_id) || []);
                    setProposedListingIds(ids);
                })
                .finally(() => setIsLoadingProposals(false));
        }
    }, [isOpen, lead, agencyId]);

    // Fetch detailed recommendations when modal is open
    const { data: recommendations, isLoading } = useQuery({
        queryKey: ["recommendations", lead?.id, agencyId],
        queryFn: () => (lead ? getRecommendedListings(agencyId, lead) : Promise.resolve([])),
        enabled: isOpen && !!lead,
        staleTime: 1000 * 60 * 2, // 2 minutes short cache
    });

    if (!lead || !lead.recommendations) return null;

    const displayList = recommendations && recommendations.length > 0 ? recommendations : (lead.recommendations || []);
    
    const hasFullData = (list: any[] | undefined) => !!list && list.length > 0 && !!list[0].property_type;
    const finalRecommendations = hasFullData(recommendations) ? recommendations! : [];

    const handlePropose = async (listingId: string, event: React.MouseEvent) => {
        event.stopPropagation();
        if (!lead) return;
        
        try {
            const res = await saveLeadListing(agencyId, lead.id, listingId);
            console.log(res);
            
            if (res.success) {
                setProposedListingIds((prev) => new Set(prev).add(listingId));
                alert("제안 완료! (테스트)");
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

            <div className="flex-1 overflow-y-auto p-2 space-y-2">
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


                        return (
                            <div
                                key={listing.id}
                                onClick={() => {
                                    router.push(`/dashboard/agencies/${agencyId}/listings?address=${encodeURIComponent(listing.address)}`);
                                    onClose();
                                }}
                                className="relative flex gap-2 p-2 border border-(--border-surface) rounded-lg hover:bg-(--background-surface-hover) transition-colors cursor-pointer"
                            >


                                {/* Info */}

                                {/* Info */}
                                <div className="flex items-center h-[36px]">
                                    <Button
                                        size="sm"
                                        variant={"outline"}
                                        disabled={proposedListingIds.has(listing.id)}
                                        onClick={(e) => handlePropose(listing.id, e)}
                                        className="absolute top-4 right-4 z-10"
                                    >
                                        {proposedListingIds.has(listing.id) ? (
                                            <>
                                                <Check width={16} height={16} className="w-4 h-4 mr-1.5" />
                                                제안 완료
                                            </>
                                        ) : (
                                            <>
                                                <Send width={16} height={16} className="mr-1.5" />
                                                제안 요청
                                            </>
                                        )}
                                    </Button>
</div>
                                    <div className="flex-1 min-w-0 pr-24">
                                        <div className="flex flex-col">
                                            <div>
                                                <div className="font-medium text-lg leading-tight mb-1 truncate flex items-center gap-2">
                                                    <span>
{(() => {
                                                        switch (listing.property_type) {
                                                            case "APARTMENT": return "아파트";
                                                            case "VILLA": return "빌라";
                                                            case "OFFICETEL": return "오피스텔";
                                                            case "ONEROOM": return "원룸";
                                                            case "COMMERCIAL": return "상가";
                                                            case "LAND": return "토지";
                                                            default: return listing.property_type;
                                                        }
                                                    })()}
                                                        {" · "}
                                                        {(() => {
                                                        switch (listing.transaction_type) {
                                                            case "WOLSE": return "월세";
                                                            case "JEONSE": return "전세";
                                                            case "SALE": return "매매";
                                                            default: return listing.transaction_type;
                                                        }
                                                    })()}
                                                    </span>
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                                                        listing.status === 'AVAILABLE' 
                                                            ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
                                                            : 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                                                    }`}>
                                                        {(() => {
                                                            switch (listing.status) {
                                                                case 'AVAILABLE': return '진행가능';
                                                                case 'CONTRACTED': return '계약완료';
                                                                case 'CANCELED': return '취소됨';
                                                                default: return listing.status;
                                                            }
                                                        })()}
                                                    </span>
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


