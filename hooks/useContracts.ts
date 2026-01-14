import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Contract } from "@/types/contract";

interface FetchContractsResponse {
    data: Contract[];
    nextCursor: number | null;
}

export function useContracts(sortConfig: { key: string; direction: "asc" | "desc" } | null = null) {
    const queryClient = useQueryClient();

    return useInfiniteQuery<FetchContractsResponse>({
        queryKey: ["contracts", sortConfig],
        queryFn: async ({ pageParam = 0 }) => {
            const params = new URLSearchParams({
                cursor: String(pageParam),
                limit: "20",
            });

            if (sortConfig) {
                params.append("sortKey", sortConfig.key);
                params.append("sortDirection", sortConfig.direction);
            }

            const response = await fetch(`/api/contracts?${params.toString()}`);
            if (!response.ok) {
                throw new Error("Failed to fetch contracts");
            }
            return response.json();
        },
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        initialPageParam: 0,
    });
}
