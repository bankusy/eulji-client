"use server";

import { createSupabaseServerClient as createClient } from "@/lib/supabase/server";
import { Lead } from "@/types/lead";
import { revalidatePath } from "next/cache";

// DB 스키마에 맞춘 타입 매핑 헬퍼 함수
import { verifyAgencyAccess } from "@/lib/auth/agency";

// DB 스키마에 맞춘 타입 매핑 헬퍼 함수
function mapLeadToDb(lead: Partial<Lead>) {
    const {
        property_type,
        transaction_type,
        message,
        assignee, // 제외 (DB 스키마상 assigned_user_id는 uuid여야 함)
        created_at, // 제외
        updated_at, // 제외
        id, // 별도 처리
        phone, // 전화번호 별도 처리 (숫자만 저장)
        assigned_user_id,
        assigned_user, 
        deposit_min,
        deposit_max,
        price_min,
        price_max,
        recommendations, // 제외 (가상 필드)
        ...rest
    } = lead as any;

    return {
        ...rest,
        // 필드명은 이미 snake_case이므로 그대로 사용
        property_type,
        transaction_type,
        deposit_min,
        deposit_max,
        price_min,
        price_max,
        message,
        phone: phone?.replace(/[^0-9]/g, ""), // 숫자만 추출하여 저장
        // undefined인 경우 업데이트 객체에 포함하지 않아 기존 값 유지 (PATCH), 값이 있으면 업데이트
        assigned_user_id: assigned_user_id === undefined ? undefined : (assigned_user_id || null),
    };
}

export async function createLead(agencyId: string, leadData: Omit<Lead, "created_at" | "updated_at">) {
    const auth = await verifyAgencyAccess(agencyId);
    if (!auth) throw new Error("Unauthorized");

    // Validation
    // if (!leadData.name || !leadData.name.trim()) {
    //    throw new Error("이름은 필수 항목입니다.");
    // }
    
    // Budget check
    if (
        (leadData.deposit_min < 0) || 
        (leadData.deposit_max < 0) || 
        (leadData.price_min < 0) || 
        (leadData.price_max < 0)
    ) {
        throw new Error("예산은 0보다 작을 수 없습니다.");
    }

    const supabase = await createClient();

    // DB 데이터로 변환
    const dbData = mapLeadToDb(leadData);

    const { data, error } = await supabase
        .from("leads")
        .insert({
            ...dbData,
            id: leadData.id, // Explicitly use provided ID if exists
            agency_id: agencyId, // Enforce agency scoping
            assigned_user_id: auth.userId // Optional: use verified user as creator/assignee if logic dictates
        })
        .select();

    if (error) {
        console.error("Error creating lead:", error);
        throw new Error(`Failed to create lead: ${error.message}`);
    }

    try {
        revalidatePath(`/dashboard/agencies/${agencyId}/leads`);
    } catch (revalError) {
        console.error("Error during revalidation:", revalError);
        // We probably don't want to throw here if the lead was created?
        // But for now let's log it.
    }
    
    return { success: true, data };
}

export async function updateLead(agencyId: string, leadData: Lead) {
    const auth = await verifyAgencyAccess(agencyId);
    if (!auth) throw new Error("Unauthorized");

    // if (!leadData.name || !leadData.name.trim()) {
    //     throw new Error("이름은 필수 항목입니다.");
    // }

    const supabase = await createClient();

    const dbData = mapLeadToDb(leadData);

    const { error } = await supabase
        .from("leads")
        .update(dbData)
        .eq("id", leadData.id)
        .eq("agency_id", agencyId); // Enforce agency ownership

    if (error) {
        console.error("Error updating lead:", error);
        throw new Error(`Failed to update lead: ${error.message}`);
    }

    try {
        revalidatePath(`/dashboard/agencies/${agencyId}/leads`);
    } catch (revalError) {
        console.error("Error during revalidation (update):", revalError);
    }
    return { success: true };
}

export async function deleteLeads(agencyId: string, ids: string[]) {
    const auth = await verifyAgencyAccess(agencyId);
    if (!auth) throw new Error("Unauthorized");

    const supabase = await createClient();
    
    const { error } = await supabase
        .from("leads")
        .delete()
        .in("id", ids)
        .eq("agency_id", agencyId); // Enforce agency ownership

    if (error) {
        console.error("Error deleting leads:", error);
        throw new Error(`Failed to delete leads: ${error.message}`);
    }

    try {
        revalidatePath(`/dashboard/agencies/${agencyId}/leads`);
    } catch (revalError) {
        console.error("Error during revalidation (delete):", revalError);
    }
    return { success: true };
}

export async function getLeads(
    agencyId: string,
    query?: string,
    searchColumns?: string[],
    sortColumn: string = "created_at",
    sortDirection: "asc" | "desc" = "desc",
    filters?: Record<string, string[]>,
    page: number = 0,
    limit: number = 20,
    includeRecommendations: boolean = false
) {
    if (!agencyId) return { data: [], nextId: null, count: 0 };
    const auth = await verifyAgencyAccess(agencyId);
    if (!auth) return { data: [], nextId: null, count: 0 };

    const supabase = await createClient();
    const from = page * limit;
    const to = from + limit - 1;

    let queryBuilder = supabase
        .from("leads")
        .select("*, assigned_user:users!assigned_user_id(name, nickname)", { count: "exact" })
        .eq("agency_id", agencyId);

    if (query && searchColumns && searchColumns.length > 0) {
        const mappedColumns = searchColumns.map((col) => {
            if (col === "message") return "message";
            if (col === "property_type") return "property_type"; 
            if (col === "transaction_type") return "transaction_type";
            return col;
        });

        const orFilter = mappedColumns
            .filter(col => ["name", "phone", "email", "source", "message"].includes(col)) 
            .map((col) => {
                if (col === "phone") {
                    const cleanQuery = query.replace(/[^0-9]/g, "");
                    if (cleanQuery) {
                        return `${col}.ilike.%${cleanQuery}%`;
                    }
                }
                return `${col}.ilike.%${query}%`;
            })
            .join(",");

        if (orFilter) {
            queryBuilder = queryBuilder.or(orFilter);
        }
    }

    if (filters) {
        Object.entries(filters).forEach(([key, values]) => {
            if (values.length > 0) {
                let dbKey = key;
                if (key === "property_type") dbKey = "property_type";
                if (key === "transaction_type") dbKey = "transaction_type";
                if (key === "message") dbKey = "message";
                
                queryBuilder = queryBuilder.in(dbKey, values);
            }
        });
    }

    // Map sort column
    const allowedSortColumns = [
        "created_at", "updated_at", "name", "phone", "email", "source",
        "stage", "message", "property_type", "transaction_type", "deposit_min",
        "deposit_max", "price_min", "price_max"
    ];
    
    // Validate and fallback to default if invalid
    const validSortColumn = allowedSortColumns.includes(sortColumn) ? sortColumn : "created_at";
    
    let dbSortColumn = validSortColumn;
    if (validSortColumn === "message") dbSortColumn = "message";
    if (validSortColumn === "property_type") dbSortColumn = "property_type";
    if (validSortColumn === "transaction_type") dbSortColumn = "transaction_type";
    // created_at, updated_at은 이미 snake_case
    if (validSortColumn === "created_at") dbSortColumn = "created_at";
    if (validSortColumn === "updated_at") dbSortColumn = "updated_at";

    queryBuilder = queryBuilder
        .order(dbSortColumn, { ascending: sortDirection === "asc" })
        .range(from, to);

    const { data, error, count } = await queryBuilder;

    if (error) {
        console.error("Error fetching leads:", error);
        return { data: [], nextId: null, count: 0 };
    }
    
    // 중복 제거: ID 기준으로 unique한 데이터만 유지
    const uniqueData = data?.reduce((acc: any[], row: any) => {
        if (!acc.find(item => item.id === row.id)) {
            acc.push(row);
        }
        return acc;
    }, []) || [];
    
    // DB 데이터를 Lead 타입으로 변환 (필드명 매핑 필요)
    const mappedData = uniqueData.map((row: any) => {
        const userObj = Array.isArray(row.assigned_user) ? row.assigned_user[0] : row.assigned_user;
        return {
            ...row,
            property_type: row.property_type,
            transaction_type: row.transaction_type,
            message: row.message,
            deposit_min: row.deposit_min,
            deposit_max: row.deposit_max,
            price_min: row.price_min,
            price_max: row.price_max,
            assigned_user_id: row.assigned_user_id,
            assignee: userObj?.nickname || userObj?.name || "", 
            created_at: row.created_at,
            updated_at: row.updated_at,
        };
    }) as Lead[];

    // Fetch recommendations ONLY if requested (Lean Loading)
    let dataWithRecommendations = mappedData;
    
    if (includeRecommendations) {
        dataWithRecommendations = await Promise.all(
            mappedData.map(async (lead) => {
                try {
                    const recommendations = await getRecommendedListings(agencyId, lead, { minimal: true });
                    if (recommendations.length > 0) {
                        console.log(`[getLeads] Lead ${lead.name} has ${recommendations.length} recs`);
                    }
                    return { ...lead, recommendations };
                } catch (err) {
                    console.error(`Failed to fetch recommendations for lead ${lead.id}`, err);
                    return { ...lead, recommendations: [] }; // Fallback to empty
                }
            })
        );
    }

    const nextId = (uniqueData && uniqueData.length === limit && (count ? from + limit < count : true))
        ? page + 1
        : null;

    return {
        data: dataWithRecommendations,
        nextId,
        count: count || 0
    };
}

export async function getRecommendedListings(agencyId: string, lead: Lead, options: { minimal?: boolean } = {}) {
    if (!agencyId) return [];
    const auth = await verifyAgencyAccess(agencyId);
    if (!auth) return [];

    const supabase = await createClient();

    let query = supabase
        .from("listings")
        .select(options.minimal ? "id" : "*")
        .eq("agency_id", agencyId)
        .eq("status", "AVAILABLE");

    // 1. Transaction Type Match
    if (lead.transaction_type) {
        query = query.eq("transaction_type", lead.transaction_type);
    }

    // 2. Property Type Match
    if (lead.property_type) {
        query = query.eq("property_type", lead.property_type);
    }

    // 4. Region Match (Moved up for debugging priority)
    if (lead.preferred_region) {
        query = query.or(`address.ilike.%${lead.preferred_region}%,address_detail.ilike.%${lead.preferred_region}%`);
    }

    // 3. Budget Match
    if (lead.transaction_type === "WOLSE") {
        if (lead.deposit_max > 0) {
            query = query.lte("deposit", lead.deposit_max);
        }
        if (lead.price_max > 0) {
            query = query.lte("rent", lead.price_max);
        }
    } else if (lead.transaction_type === "JEONSE") {
        if (lead.deposit_max > 0) {
            query = query.lte("deposit", lead.deposit_max);
        }
    } else if (lead.transaction_type === "SALE") {
        if (lead.price_max > 0) {
            query = query.lte("price_selling", lead.price_max);
        }
    }

    // Limit candidates
    const { data } = await query.limit(10);
    
    return data || [];
}

export async function saveLeadListing(agencyId: string, leadId: string, listingId: string) {
    const auth = await verifyAgencyAccess(agencyId);
    if (!auth) throw new Error("Unauthorized");

    const supabase = await createClient();

    const { error } = await supabase
        .from("lead_listings")
        .insert({
            agency_id: agencyId,
            lead_id: leadId,
            listing_id: listingId,
            relation_type: "RECOMMENDED",
        });

    if (error) {
        // 이미 추천된 경우 등 중복 에러 처리 (무시하거나 알림)
        if (error.code === "23505") { // Unique violation
             return { success: false, message: "이미 추천된 매물입니다." };
        }
        console.error("Error saving lead listing:", error);
        throw new Error(`Failed to save recommendation: ${error.message}`);
    }

    return { success: true };
}

