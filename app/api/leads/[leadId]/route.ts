import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/service";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ leadId: string }> }
) {
    const user = await getAuthenticatedUser();
    const { leadId } = await params;

    if (!leadId || leadId === "undefined") {
        return NextResponse.json({ error: "Invalid lead ID" }, { status: 400 });
    }

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!user.agencyId) {
        return NextResponse.json({ error: "Agency not found for user" }, { status: 403 });
    }

    const supabase = await createSupabaseServerClient();
    const body = await request.json();
    const { custom_id, ...updateData } = body;

    // Verify lead belongs to agency
    // We can do this implicitly by adding agency_id to the update query filter
    const { data: updatedLead, error: updateError } = await supabase
        .from("leads")
        .update(updateData)
        .eq("id", leadId)
        .eq("agency_id", user.agencyId)
        .select()
        .single();

    if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Check if stage is changed to SUCCESS and create contract
    // Check if stage is changed
    if (body.stage) {
        if (body.stage === "SUCCESS") {
            // Case 1: Changed TO Success -> Create Contract if not exists

            // First check if contract already exists for this lead
            const { data: existingContract } = await supabase
                .from("contracts")
                .select("id")
                .eq("lead_id", leadId)
                .single();

            if (!existingContract) {
                // Create Contract
                // Extract Contract details from Lead
                const generateContractId = () => {
                    const today = new Date();
                    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
                    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
                    return `C-${dateStr}-${randomSuffix}`;
                };

                const contractData = {
                    agency_id: user.agencyId,
                    lead_id: leadId,
                    user_id: user.publicUserId, // Use public ID for referencing

                    custom_id: body.custom_id || generateContractId(), // Use provided ID or generate one

                    contract_date: new Date().toISOString().slice(0, 10),
                    transaction_type: body.transactionType || "SALE", // Default or extract based on camelCase payload

                    price: body.priceMin || 0, // Simplified mapping: use min price as contract price
                    deposit: body.depositMin || 0,
                    rent: 0, // Rent not in basic budget fields, assume 0 or add logic if needed

                    status: 'DRAFT'
                };

                const { error: contractError } = await supabase
                    .from("contracts")
                    .insert(contractData);

                if (contractError) {
                    console.error("Failed to create contract", contractError);
                }
            }
        } else {
            // Case 2: Changed FROM Success (or any other status) TO non-Success -> Delete Contract if exists
            // It's safer to always try to delete if the new status is NOT SUCCESS

            const { error: deleteError } = await supabase
                .from("contracts")
                .delete()
                .eq("lead_id", leadId);

            if (deleteError) {
                console.error("Failed to delete contract", deleteError);
            }
        }
    }

    return NextResponse.json(updatedLead);
}
