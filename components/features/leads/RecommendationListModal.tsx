"use client";

import React, { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Lead } from "@/types/lead";
import { Listing } from "@/types/listing";
import { saveLeadListing } from "@/app/dashboard/agencies/[agencyId]/leads/actions";
import { useQueryClient } from "@tanstack/react-query";
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

    if (!lead || !lead.recommendations) return null;

    const handlePropose = async (listingId: string) => {
        try {
            const res = await saveLeadListing(agencyId, lead.id, listingId);
            if (res.success) {
                setProposedIds((prev) => new Set(prev).add(listingId));
                // Optional: Invalidate queries if we want to update some "related listings" view immediately
                // queryClient.invalidateQueries({ queryKey: ["lead-listings", lead.id] });
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
                    {lead.name}님에게 적합한 매물이 {lead.recommendations.length}건 있습니다.
                </p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {lead.recommendations.length === 0 ? (
                    <div className="text-center py-12 text-(--foreground-muted)">
                        추천할 매물이 없습니다.
                    </div>
                ) : (
                    lead.recommendations.map((listing: any) => {
                        const isProposed = proposedIds.has(listing.id);

                        return (
                            <div
                                key={listing.id}
                                className="flex gap-4 p-4 border border-(--border-surface) rounded-lg hover:bg-(--background-subtle) transition-colors"
                            >
                                {/* Image / Thumbnail */}
                                <div className="w-32 h-24 bg-gray-100 rounded-md shrink-0 overflow-hidden relative">
                                    {/* Placeholder if no image logic yet, assuming listing might have images array */}
                                    <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">
                                        No Image
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="font-medium text-lg leading-tight mb-1">
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

                                        <Button
                                            size="sm"
                                            variant={isProposed ? "outline" : "primary"}
                                            disabled={isProposed}
                                            onClick={() => handlePropose(listing.id)}
                                            className="ml-4 shrink-0"
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
