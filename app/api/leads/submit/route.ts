import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            agencyId,
            userId, // 개인별 폼에서 전달
            name,
            phone,
            preferred_region,
            property_type,
            transaction_type,
            move_in_date,
        } = body;

        // 1. Validation
        if (!agencyId || !name || !phone) {
            return NextResponse.json(
                { error: "필수 정보를 입력해주세요." },
                { status: 400 }
            );
        }

        // 전화번호 형식 검증 (한국 휴대폰)
        const phoneRegex = /^01[0-9]-?\d{3,4}-?\d{4}$/;
        if (!phoneRegex.test(phone.replace(/-/g, ""))) {
            return NextResponse.json(
                { error: "올바른 휴대폰 번호를 입력해주세요." },
                { status: 400 }
            );
        }

        const supabase = await createSupabaseServerClient();

        // 2. Verify Agency Exists
        const { data: agency, error: agencyError } = await supabase
            .from("agencies")
            .select("id, name, kakao_url")
            .eq("id", agencyId)
            .single();

        if (agencyError || !agency) {
            return NextResponse.json(
                { error: "에이전시를 찾을 수 없습니다." },
                { status: 404 }
            );
        }

        // 2-1. 개인별 폼인 경우 사용자 존재 확인
        let assignedUserId = null;
        let userKakaoUrl = null;

        if (userId) {
            const { data: user, error: userError } = await supabase
                .from("users")
                .select("id, kakao_url")
                .eq("id", userId)
                .single();

            if (userError || !user) {
                return NextResponse.json(
                    { error: "담당자를 찾을 수 없습니다." },
                    { status: 404 }
                );
            }

            // 해당 사용자가 이 에이전시 소속인지 확인
            const { data: membership } = await supabase
                .from("agency_users")
                .select("id")
                .eq("agency_id", agencyId)
                .eq("user_id", userId)
                .eq("status", "ACTIVE")
                .single();

            if (!membership) {
                return NextResponse.json(
                    { error: "담당자가 이 에이전시 소속이 아닙니다." },
                    { status: 403 }
                );
            }

            assignedUserId = userId;
            userKakaoUrl = user.kakao_url;
        }

        // 3. Create Lead
        const { data: lead, error: leadError } = await supabase
            .from("leads")
            .insert({
                agency_id: agencyId,
                assigned_user_id: assignedUserId, // 개인별 폼이면 자동 배정
                name,
                phone: phone.replace(/-/g, ""), // 대시 제거하여 저장
                preferred_region: preferred_region || null,
                property_type: property_type || "OFFICETEL",
                transaction_type: transaction_type || "WOLSE",
                move_in_date: move_in_date || null,
                stage: "NEW",
                source: "WEB_FORM",
                message: assignedUserId 
                    ? `담당자 개인 폼을 통해 등록된 리드입니다.`
                    : `웹 문의 폼을 통해 등록된 리드입니다.`,
            })
            .select("id")
            .single();

        if (leadError) {
            console.error("Lead creation error:", leadError);
            return NextResponse.json(
                { error: "리드 등록에 실패했습니다." },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            leadId: lead.id,
            userId: assignedUserId,
            agency: {
                name: agency.name,
                kakao_url: userKakaoUrl || agency.kakao_url, // 개인 우선, 없으면 사무실
            },
        });
    } catch (error) {
        console.error("Unexpected error:", error);
        return NextResponse.json(
            { error: "서버 오류가 발생했습니다." },
            { status: 500 }
        );
    }
}
