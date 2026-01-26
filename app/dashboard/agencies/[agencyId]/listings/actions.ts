"use server";

import { createSupabaseServerClient as createClient } from "@/lib/supabase/server";
import { Listing } from "@/types/listing";
import { revalidatePath } from "next/cache";

// --- Groups ---

import { verifyAgencyAccess } from "@/lib/auth/agency";

// --- Groups ---

export async function getListingGroups(agencyId?: string) {
    if (!agencyId) return [];
    
    const auth = await verifyAgencyAccess(agencyId);
    if (!auth) return [];

    const supabase = await createClient();

    // Fetch minimal data for grouping
    const { data, error } = await supabase
        .from("listings")
        .select("id, address, name, status, created_at") 
        .eq("agency_id", agencyId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching listing groups:", error);
        return [];
    }

    // Group by address (client-side aggregation for MVP)
    const groups: Record<string, { address: string; count: number; name: string; latest_status: string }> = {};

    data?.forEach((listing) => {
        const key = listing.address;
        if (!groups[key]) {
            groups[key] = {
                address: key,
                count: 0,
                name: listing.name,
                latest_status: listing.status
            };
        }
        groups[key].count++;
    });

    return Object.values(groups);
}

export async function updateListingGroup(agencyId: string, address: string, newName: string) {
    const auth = await verifyAgencyAccess(agencyId);
    if (!auth) throw new Error("Unauthorized");

    const supabase = await createClient();

    const { error } = await supabase
        .from("listings")
        .update({ name: newName })
        .eq("agency_id", agencyId)
        .eq("address", address);

    if (error) throw new Error(error.message);

    revalidatePath(`/dashboard/agencies/${agencyId}/listings`);
    return { success: true };
}

export async function getListings(
    agencyId: string,
    address: string | null,
    sortColumn: string = "created_at",
    sortDirection: "asc" | "desc" = "desc",
    page: number = 0,
    limit: number = 20,
    searchQuery?: string,
    searchColumns?: string[],
    filters?: Record<string, string[]>
) {
    if (!agencyId) return { data: [], nextId: null, count: 0 };
    const auth = await verifyAgencyAccess(agencyId);
    if (!auth) return { data: [], nextId: null, count: 0 };

    const supabase = await createClient();
    const from = page * limit;
    const to = from + limit - 1;

    let queryBuilder = supabase
        .from("listings")
        .select("*", { count: "exact" })
        .eq("agency_id", agencyId);

    if (address) {
        queryBuilder = queryBuilder.eq("address", address);
    }

    if (searchQuery) {
        // Search across fields
        if (searchColumns && searchColumns.length > 0) {
            const orConditions = searchColumns
                .map((col) => `${col}.ilike.%${searchQuery}%`)
                .join(",");
            queryBuilder = queryBuilder.or(orConditions);
        } else {
            // Fallback default search
            queryBuilder = queryBuilder.or(`address_detail.ilike.%${searchQuery}%,name.ilike.%${searchQuery}%,memo.ilike.%${searchQuery}%,owner_contact.ilike.%${searchQuery}%`);
        }
    }

    if (filters) {
        Object.entries(filters).forEach(([key, values]) => {
            if (values && values.length > 0) {
                // Check allowed columns for safety if needed, or trust schema
                // Common filterable columns: status, transaction_type, property_type
                 if (['status', 'transaction_type', 'property_type'].includes(key)) {
                     queryBuilder = queryBuilder.in(key, values);
                 }
            }
        });
    }

    // Sort validation
    const allowedSortColumns = [
        "created_at", "updated_at", "status", "name", "address",
        "price_selling", "deposit", "rent", "area_private_m2",
        "area_supply_m2", "floor", "total_floors"
    ];
    const validSortColumn = allowedSortColumns.includes(sortColumn) ? sortColumn : "created_at";

    queryBuilder = queryBuilder
        .order(validSortColumn, { ascending: sortDirection === "asc" })
        .range(from, to);

    const { data, error, count } = await queryBuilder;

    if (error) {
        console.error("Error fetching listings:", error);
        return { data: [], nextId: null, count: 0 };
    }

    // 중복 제거: ID 기준으로 unique한 데이터만 유지
    const uniqueData = data?.reduce((acc: any[], row: any) => {
        if (!acc.find(item => item.id === row.id)) {
            acc.push(row);
        }
        return acc;
    }, []) || [];

    const nextId = (uniqueData && uniqueData.length === limit && (count ? from + limit < count : true))
        ? page + 1
        : null;

    return {
        data: uniqueData as Listing[], // Cast assuming DB matches type
        nextId,
        count: count || 0
    };
}

export async function createListing(agencyId: string, listingData: Partial<Listing>) {
    const auth = await verifyAgencyAccess(agencyId);
    if (!auth) throw new Error("Unauthorized");

    const supabase = await createClient();

    const { data, error } = await supabase
        .from("listings")
        .insert({
            ...listingData,
            agency_id: agencyId,
            assigned_user_id: auth.userId // Use verified userId
        })
        .select()
        .single();

    if (error) {
        console.error("Error creating listing:", error);
        throw new Error(error.message);
    }

    revalidatePath(`/dashboard/agencies/${agencyId}/listings`);
    return { success: true, data };
}

export async function updateListing(agencyId: string, listing: Partial<Listing> & { id: string }) {
    const auth = await verifyAgencyAccess(agencyId);
    if (!auth) throw new Error("Unauthorized");

    const supabase = await createClient();

    const { id, ...updates } = listing;

    const { error } = await supabase
        .from("listings")
        .update(updates)
        .eq("id", id)
        .eq("agency_id", agencyId); // Ensure ownership

    if (error) {
        console.error("Error updating listing:", error);
        throw new Error(error.message);
    }

    revalidatePath(`/dashboard/agencies/${agencyId}/listings`);
    return { success: true };
}

export async function deleteListings(agencyId: string, ids: string[]) {
    const auth = await verifyAgencyAccess(agencyId);
    if (!auth) throw new Error("Unauthorized");

    const supabase = await createClient();

    const { error } = await supabase
        .from("listings")
        .delete()
        .in("id", ids)
        .eq("agency_id", agencyId);

    if (error) {
        console.error("Error deleting listings:", error);
        throw new Error(error.message);
    }

    revalidatePath(`/dashboard/agencies/${agencyId}/listings`);
    return { success: true };
}
