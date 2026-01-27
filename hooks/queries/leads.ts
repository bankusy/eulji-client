import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { getLeads, createLead, updateLead, deleteLeads, getRecommendedListings } from "@/app/dashboard/agencies/[agencyId]/leads/actions";
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
    initialData?: LeadsResponse;
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
                20, // limit
                true // includeRecommendations
            ),
        initialPageParam: 0,
        getNextPageParam: (lastPage) => lastPage.nextId ?? undefined,
        staleTime: 1000 * 60, // 1 minute
        enabled: !!params.agencyId,
        initialData: params.initialData
            ? {
                  pages: [params.initialData],
                  pageParams: [0],
              }
            : undefined,
    });
};

/**
 * Lead Mutations
 */
export const useLeadMutations = (agencyId: string) => {
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: (data: Lead) => createLead(agencyId, data),
        onMutate: async (newLead) => {
            // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries({ queryKey: ["leads"] });

            // Snapshot the previous value
            const previousLeads = queryClient.getQueryData(["leads"]);

            // Optimistically update to the new value
            queryClient.setQueriesData({ queryKey: ["leads"] }, (old: any) => {
                if (!old) return old;
                
                // Add the new lead to the beginning of the FIRST page
                const firstPage = old.pages[0];
                return {
                    ...old,
                    pages: [
                        {
                            ...firstPage,
                            data: [newLead, ...firstPage.data],
                            count: (firstPage.count || 0) + 1
                        },
                        ...old.pages.slice(1)
                    ]
                };
            });

            // Return a context object with the snapshotted value
            return { previousLeads };
        },
        onError: (err, newLead, context) => {
            // If the mutation fails, use the context returned from onMutate to roll back
            if (context?.previousLeads) {
                queryClient.setQueriesData({ queryKey: ["leads"] }, context.previousLeads);
            }
        },
        onSettled: () => {
            // Always refetch after error or success to ensure synchronization
            queryClient.invalidateQueries({ queryKey: ["leads"] });
        },
    });

    const updateMutation = useMutation({
        mutationFn: (data: Lead) => updateLead(agencyId, data),
        onMutate: async (newLead) => {
            await queryClient.cancelQueries({ queryKey: ["leads"] });

            const previousLeads = queryClient.getQueryData(["leads"]);

            queryClient.setQueriesData({ queryKey: ["leads"] }, (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    pages: old.pages.map((page: any) => ({
                        ...page,
                        data: page.data.map((lead: Lead) =>
                            lead.id === newLead.id ? { ...lead, ...newLead } : lead
                        ),
                    })),
                };
            });

            return { previousLeads };
        },
        onError: (err, newLead, context) => {
            if (context?.previousLeads) {
                queryClient.setQueriesData({ queryKey: ["leads"] }, context.previousLeads);
            }
        },
        onSettled: () => {
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
