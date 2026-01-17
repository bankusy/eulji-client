"use server";

import { createSupabaseServerClient as createClient } from "@/lib/supabase/server";
import { Lead } from "@/types/lead";
import { revalidatePath } from "next/cache";

// DB 스키마에 맞춘 타입 매핑 헬퍼 함수
import { verifyAgencyAccess } from "@/lib/auth/agency";

// DB 스키마에 맞춘 타입 매핑 헬퍼 함수
function mapLeadToDb(lead: Partial<Lead>) {
    const {
        propertyType,
        transactionType,
        message,
        assignee, // 제외 (DB 스키마상 assigned_user_id는 uuid여야 함)
        createdAt, // 제외
        updatedAt, // 제외
        id, // 별도 처리
        phone, // 전화번호 별도 처리 (숫자만 저장)
        ...rest
    } = lead;

    return {
        ...rest,
        // 필드명 매핑 및 Enum 변환
        property: propertyType,
        transaction: transactionType,
        message: message,
        phone: phone?.replace(/[^0-9]/g, ""), // 숫자만 추출하여 저장
        // assignee는 현재 텍스트로 입력받으므로 DB의 assigned_user_id(uuid)에 넣을 수 없음
        // 필요하다면 users 테이블 조회 후 ID 변환 로직이 필요하나 현재는 제외
    };
}

export async function createLead(agencyId: string, leadData: Omit<Lead, "id" | "createdAt" | "updatedAt">) {
    const auth = await verifyAgencyAccess(agencyId);
    if (!auth) throw new Error("Unauthorized");

    // Validation
    if (!leadData.name || !leadData.name.trim()) {
        throw new Error("이름은 필수 항목입니다.");
    }
    
    // Budget check
    if (
        (leadData.budget.depositMin < 0) || 
        (leadData.budget.depositMax < 0) || 
        (leadData.budget.priceMin < 0) || 
        (leadData.budget.priceMax < 0)
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

    if (!leadData.name || !leadData.name.trim()) {
        throw new Error("이름은 필수 항목입니다.");
    }

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
    limit: number = 20
) {
    if (!agencyId) return { data: [], nextId: null, count: 0 };
    const auth = await verifyAgencyAccess(agencyId);
    if (!auth) return { data: [], nextId: null, count: 0 };

    const supabase = await createClient();
    const from = page * limit;
    const to = from + limit - 1;

    let queryBuilder = supabase
        .from("leads")
        .select("*",  { count: "exact" })
        .eq("agency_id", agencyId);

    if (query && searchColumns && searchColumns.length > 0) {
        const mappedColumns = searchColumns.map((col) => {
            if (col === "message") return "message";
            if (col === "propertyType") return "property"; 
            if (col === "transactionType") return "transaction";
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
                if (key === "propertyType") dbKey = "property";
                if (key === "transactionType") dbKey = "transaction";
                if (key === "message") dbKey = "message";
                
                queryBuilder = queryBuilder.in(dbKey, values);
            }
        });
    }

    // Map sort column
    let dbSortColumn = sortColumn;
    if (sortColumn === "message") dbSortColumn = "message";
    if (sortColumn === "propertyType") dbSortColumn = "property";
    if (sortColumn === "transactionType") dbSortColumn = "transaction";
    // createdAt -> created_at (if frontend sends camelCase, though Lead type has createdAt but usually we might sort by key defined in col config)
    if (sortColumn === "createdAt") dbSortColumn = "created_at";
    if (sortColumn === "updatedAt") dbSortColumn = "updated_at";

    queryBuilder = queryBuilder
        .order(dbSortColumn, { ascending: sortDirection === "asc" })
        .range(from, to);

    const { data, error, count } = await queryBuilder;

    if (error) {
        console.error("Error fetching leads:", error);
        return { data: [], nextId: null, count: 0 };
    }
    
    // DB 데이터를 Lead 타입으로 변환 (필드명 매핑 필요)
    const mappedData = data.map((row: any) => ({
        ...row,
        propertyType: row.property,
        transactionType: row.transaction,
        message: row.message,
        budget: row.budget || {}, // jsonb field might be null, but default is '{}'
        assigned_user_id: row.assigned_user_id, // keep for ref if needed
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    })) as Lead[];

    const nextId = (data && data.length === limit && (count ? from + limit < count : true))
        ? page + 1
        : null;

    return {
        data: mappedData,
        nextId,
        count: count || 0
    };
}
