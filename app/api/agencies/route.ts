import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { handleApiError } from "@/lib/api-error";
import { logActivity } from "@/lib/audit";

const createAgencySchema = z.object({
    name: z.string().min(1, "Agency name is required").max(50, "Name allows up to 50 chars"),
    license_no: z.string().optional(),
});

export async function POST(req: NextRequest) {
    try {
        const supabase = await createSupabaseServerClient();

        // 1. Auth Check
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            throw new Error("Unauthorized");
        }

        const json = await req.json();
        const validationResult = createAgencySchema.safeParse(json);

        if (!validationResult.success) {
            // Re-throw as ZodError or handle directly using helper if we want custom 400 immediately
            // But handleApiError handles ZodError if instantiated, or we can just return strictly here.
            // Let's rely on manual return for validation to match previous strict structure, 
            // or throw ZodError. Let's return manually for clarity.
             return NextResponse.json(
                { error: "Invalid input", details: validationResult.error.format() },
                { status: 400 }
            );
        }

        const { name } = validationResult.data;

        // 2. Fetch Public User first
        const { data: publicUser, error: userFetchError } = await supabase
            .from("users")
            .select("id")
            .eq("email", user.email)
            .single();

        if (userFetchError || !publicUser) {
             return NextResponse.json({ error: "Public user profile not found" }, { status: 404 });
        }

        // 2a. Check ownership limit (Max 5)
        const { count, error: countError } = await supabase
            .from("agency_users")
            .select("*", { count: 'exact', head: true })
            .eq("user_id", publicUser.id)
            .eq("role", "OWNER")
            .eq("status", "ACTIVE");
        
        if (countError) throw new Error("Failed to check agency limit");

        if ((count || 0) >= 5) {
             return NextResponse.json({ error: "에이전시 생성 제한을 초과했습니다. (계정당 최대 5개)" }, { status: 400 });
        }

        // 3. Create Agency
        const { data: agency, error: createError } = await supabase
            .from("agencies")
            .insert({
                name,
                invite_code: Math.random().toString(36).substring(2, 8).toUpperCase()
            })
            .select("id")
            .single();

        if (createError) throw new Error("Failed to create agency");

        // 4. Create Agency User (OWNER)
        const { error: linkError } = await supabase
            .from("agency_users")
            .insert({
                agency_id: agency.id,
                user_id: publicUser.id,
                role: "OWNER",
                status: "ACTIVE"
            });

        if (linkError) throw new Error("Failed to link user to agency");
        
        // 5. Create Default Subscription (Plan: Free)
        const { error: subError } = await supabase
            .from("agency_subscriptions")
            .insert({
                agency_id: agency.id,
                plan_id: 'free',
                status: 'ACTIVE',
                current_period_start: new Date().toISOString(),
                current_period_end: new Date(new Date().setFullYear(new Date().getFullYear() + 100)).toISOString() // Indefinite for free? Or monthly? Let's say indefinite for now or Handle standard logic
            });
            
        // Note: If subscription fails, we might want to rollback agency creation, but for MVP let's just log.
        if (subError) console.error("Failed to create default subscription", subError);

        // Log the activity (fire and forget)
        logActivity(
            user.id,
            "AGENCY_CREATED",
            { agencyId: agency.id, name: name },
            req.headers.get("x-forwarded-for") || "unknown"
        );

        return NextResponse.json({ success: true, agencyId: agency.id });

    } catch (error) {
        return handleApiError(error);
    }
}
