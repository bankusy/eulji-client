import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { getLeads, createLead, updateLead, deleteLeads } from "@/app/dashboard/agencies/[agencyId]/leads/actions";
import { Lead } from "@/types/lead";

interface LeadsResponse {
    data: Lead[];
    nextId: number | null;
    count: number;
}

/**
 * Fetch Leads (Query)
 * Keys: ['leads', query, searchColumns, sortColumn, sortDirection, filters]
 */
interface UseLeadsParams {
    agencyId: string;
    query?: string;
    searchColumns?: string[];
    sortColumn?: string;
    sortDirection?: "asc" | "desc";
    filters?: Record<string, string[]>;
}

export const useLeads = (params: UseLeadsParams) => {
    return useInfiniteQuery({
        queryKey: ["leads", params],
        queryFn: ({ pageParam = 0 }) =>
            getLeads(
                params.agencyId,
                params.query,
                params.searchColumns,
                params.sortColumn,
                params.sortDirection,
                params.filters,
                pageParam,
                20 // limit
            ),
        initialPageParam: 0,
        getNextPageParam: (lastPage) => lastPage.nextId ?? undefined,
        staleTime: 1000 * 60, // 1 minute
        enabled: !!params.agencyId,
    });
};

/**
 * Lead Mutations
 */
export const useLeadMutations = (agencyId: string) => {
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: (data: Omit<Lead, "id" | "createdAt" | "updatedAt">) => createLead(agencyId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["leads"] });
        },
    });

    const updateMutation = useMutation({
        mutationFn: (data: Lead) => updateLead(agencyId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["leads"] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (ids: string[]) => deleteLeads(agencyId, ids),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["leads"] });
        },
    });

    return {
        createLead: createMutation,
        updateLead: updateMutation,
        deleteLeads: deleteMutation,
    };
};
