import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
    createListing, 
    deleteListings, 
    getListingGroups, 
    getListings, 
    updateListing, 
    updateListingGroup 
} from "@/app/dashboard/agencies/[agencyId]/listings/actions";
import { Listing } from "@/types/listing";

// --- Groups ---

export const useListingGroups = (agencyId: string) => {
    return useQuery({
        queryKey: ["listingGroups", agencyId],
        queryFn: () => getListingGroups(agencyId),
        staleTime: 1000 * 60 * 5, // 5 minutes
        enabled: !!agencyId
    });
};


// --- Listings ---

export type UseListingsParams = {
    agencyId: string;
    address: string | null;
    sortConfig?: { key: string; direction: "asc" | "desc" } | null;
    searchQuery?: string;
    filters?: Record<string, string[]>;
};

export const useListings = ({ agencyId, address, sortConfig, searchQuery, filters }: UseListingsParams) => {
    return useInfiniteQuery({
        queryKey: ["listings", agencyId, address, sortConfig, searchQuery, filters],
        queryFn: async ({ pageParam = 0 }) => {
            return getListings(
                agencyId,
                address,
                sortConfig?.key,
                sortConfig?.direction,
                pageParam,
                20, // limit
                searchQuery,
                filters
            );
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage) => lastPage.nextId ?? undefined,
        staleTime: 1000 * 60, // 1 minute
        enabled: !!agencyId, 
    });
};

export const useListingMutations = (agencyId: string) => {
    const queryClient = useQueryClient();

    const create = useMutation({
        mutationFn: (data: Partial<Listing>) => createListing(agencyId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["listingGroups", agencyId] }); 
            queryClient.invalidateQueries({ queryKey: ["listings", agencyId] });
        },
    });

    const update = useMutation({
        mutationFn: (data: Partial<Listing> & { id: string }) => updateListing(agencyId, data),
        onSuccess: () => {
            // Optimistic update strategies could be added here
            queryClient.invalidateQueries({ queryKey: ["listings", agencyId] });
            queryClient.invalidateQueries({ queryKey: ["listingGroups", agencyId] }); 
        },
    });

    const remove = useMutation({
        mutationFn: (ids: string[]) => deleteListings(agencyId, ids),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["listings", agencyId] });
            queryClient.invalidateQueries({ queryKey: ["listingGroups", agencyId] });
        },
    });

    return { 
        createListing: create, 
        updateListing: update, 
        deleteListings: remove 
    };
};
