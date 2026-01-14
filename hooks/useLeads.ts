import { useInfiniteQuery } from "@tanstack/react-query";
import { Lead } from "@/types/lead";

type LeadsResponse = {
    data: Lead[];
    nextId: number | null;
    count: number;
};

export function useLeads() {
    return useInfiniteQuery<LeadsResponse>({
        queryKey: ["leads"],
        queryFn: async ({ pageParam = 0 }) => {
            const res = await fetch(`/api/leads?page=${pageParam}&limit=20`);
            if (!res.ok) {
                throw new Error("Network response was not ok");
            }
            return res.json();
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage: LeadsResponse) => lastPage.nextId ?? undefined,
        staleTime: 1000 * 60 * 5, // 5 minutes cache
    });
}
