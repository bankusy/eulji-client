import { Tooltip } from "@/components/ui/Tooltip";
import { HelpCircle } from "lucide-react";
import { PropertyType, TransactionType } from "@/types/listing";


// create table public.leads (
//   id uuid not null default gen_random_uuid (),
//   agency_id uuid null,
//   assigned_user_id uuid null,
//   name character varying(100) null,
//   phone character varying(50) null,
//   email character varying(100) null,
//   social_profiles jsonb null default '{}'::jsonb,
//   stage public.lead_stage not null default 'NEW'::lead_stage,
//   source public.lead_source null default 'ETC'::lead_source,
//   preferences jsonb null default '{}'::jsonb,
//   converted_customer_id uuid null,

//   message text null,
//   memo text null,
//   budget jsonb null default '{}'::jsonb,
//   preferred_type public.property_type null,
//   preferred_budget jsonb not null default '{}'::jsonb,
//   property_type public.property_type null,
//   transaction_type public.transaction_type null,
//   deposit_min numeric null,
//   deposit_max numeric null,
//   price_min numeric null,
//   price_max numeric null,
//   move_in_date text null,
//   preferred_region text null,
//   created_by uuid null,
//   channel_meta jsonb not null default '{}'::jsonb,

//   created_at timestamp with time zone null default now(),
//   updated_at timestamp with time zone null default now(),
//   constraint leads_pkey primary key (id),
//   constraint leads_agency_id_fkey foreign KEY (agency_id) references agencies (id),
//   constraint leads_assigned_user_id_fkey foreign KEY (assigned_user_id) references users (id),
//   constraint leads_created_by_fkey foreign KEY (created_by) references users (id)
// ) TABLESPACE pg_default;

// create index IF not exists idx_leads_agency_id on public.leads using btree (agency_id) TABLESPACE pg_default;

// create index IF not exists idx_leads_assigned_user_id on public.leads using btree (assigned_user_id) TABLESPACE pg_default;

// create index IF not exists idx_leads_deposit_min on public.leads using btree (deposit_min) TABLESPACE pg_default;

// create index IF not exists idx_leads_deposit_max on public.leads using btree (deposit_max) TABLESPACE pg_default;

// create index IF not exists idx_leads_price_min on public.leads using btree (price_min) TABLESPACE pg_default;

// create index IF not exists idx_leads_price_max on public.leads using btree (price_max) TABLESPACE pg_default;

// create index IF not exists idx_leads_phone on public.leads using btree (phone) TABLESPACE pg_default
// where
//   (phone is not null);

// create index IF not exists idx_leads_email on public.leads using btree (email) TABLESPACE pg_default
// where
//   (email is not null);

// create index IF not exists idx_leads_budget on public.leads using gin (budget) TABLESPACE pg_default;

// create index IF not exists idx_leads_property on public.leads using btree (property_type) TABLESPACE pg_default;

// create index IF not exists idx_leads_transaction on public.leads using btree (transaction_type) TABLESPACE pg_default;

// create index IF not exists idx_leads_preferences on public.leads using gin (preferences) TABLESPACE pg_default;

// create index IF not exists idx_leads_agency_stage on public.leads using btree (agency_id, stage) TABLESPACE pg_default;

// create trigger update_leads_updated_at BEFORE
// update on leads for EACH row
// execute FUNCTION update_updated_at_column ();

// 리드 상태
export type LeadStage = "NEW" | "IN_PROGRESS" | "RESERVED" | "CONTRACTED" | "CANCELED" | "FAILED";

// 리드-매물 관계
export type LeadListingRelation = "RECOMMENDED" | "VIEWED" | "CONTRACT";

// 유입 경로
export type LeadSource = "NAVER" | "ZIGBANG" | "DABANG" | "PETERPAN" | "BLOG" | "INSTAGRAM" | "WALKIN" | "REFERRAL" | "WEB_FORM" | "YOUTUBE" | "KAKAO" | "CAFE" | "ETC";

export interface Lead {
    id: string;
    name: string;
    phone: string;
    email: string;
    stage: LeadStage;
    assignee: string; // 담당자 (표시용)
    property_type: string;
    transaction_type: TransactionType; // 월세, 전세, 매매
    deposit_min: number;
    deposit_max: number;
    price_min: number;
    price_max: number;
    message: string; // 문의 내용
    memo: string; // 메모
    source: LeadSource; // 유입 경로
    preferred_region?: string; // 희망 지역
    move_in_date?: string; // 입주 시기
    channel_meta?: Record<string, any>; // 채널 메타데이터
    converted_customer_id?: string; // 전환된 고객 ID
    created_at: string;
    updated_at: string;
    assigned_user_id?: string; // 담당자 ID
    recommendations?: any[]; // Recommended Listings (Used in UI)
}

import { DataTableColumn } from "@/components/ui/table/types";

// ... (existing code top)

export const leadColumns: DataTableColumn[] = [
    {
        key: "name",
        type: "text",
        name: "이름",
        sticky: true,
        // left: "48px", // 체크박스 너비
        width: "120px",
        minWidth: "50px",
        maxWidth: "300px",
        headerAlign: "start",
        cellAlign: "center",
        editable: true,
        render: (lead: any) => <div className="font-semibold">{lead.name}</div>,
    },
    {
        key: "phone",
        type: "phone", // Changed to phone type for editor
        name: "휴대폰",
        sticky: true,
        left: "288px",
        width: "120px",
        minWidth: "50px",
        maxWidth: "300px",

        headerAlign: "start",
        cellAlign: "center",
        editable: true,
        render: (lead: Lead) => {
            return lead.phone?.replace(
                /^(\d{2,3})(\d{3,4})(\d{4})$/,
                "$1-$2-$3",
            );
        },
    },
    {
        key: "stage",
        type: "select",
        name: "상태",
        // sticky: false,
        // left: "168px",
        width: "120px",
        minWidth: "50px",
        maxWidth: "300px",
        headerAlign: "start",
        cellAlign: "center",
        editable: true,
        options: [
            { label: "신규", value: "NEW", color: "bg-[#5D8067] text-white" }, // Muted Green
            { label: "진행 중", value: "IN_PROGRESS", color: "bg-[#5B7C99] text-white" }, // Muted Blue
            { label: "예약", value: "RESERVED", color: "bg-[#C28C5D] text-white" }, // Muted Orange
            { label: "계약 완료", value: "CONTRACTED", color: "bg-[#8C7B9F] text-white" }, // Muted Purple
            { label: "계약 취소", value: "CANCELED", color: "bg-[#BF6B8E] text-white" }, // Muted Red (Rose)
            { label: "계약 실패", value: "FAILED", color: "bg-[#888888] text-white" }, // Gray
        ],

        render: (lead: Lead) => {
            const option = leadColumns.find(c => c.key === "stage")?.options?.find(o => o.value === lead.stage);
            return (
                <div className={`w-full h-full flex items-center justify-center ${option?.color || "bg-secondary text-secondary-foreground"}`}>
                    {option?.label || lead.stage}
                </div>
            );
        },
    },
    {
        key: "transaction_type",
        type: "select",
        name: "거래",
        sticky: false,
        left: "168px",
        width: "120px",
        minWidth: "50px",
        maxWidth: "300px",

        headerAlign: "start",
        cellAlign: "center",
        editable: true,
        options: [
            { label: "월세", value: "WOLSE" },
            { label: "전세", value: "JEONSE" },
            { label: "매매", value: "SALE" },
        ],
        render: (lead: Lead) => {
            const option = leadColumns.find(c => c.key === "transaction_type")?.options?.find(o => o.value === lead.transaction_type);
            return option?.label || lead.transaction_type;
        },
    },
    {
        key: "property_type",
        type: "select",
        name: "매물",
        width: "120px",
        minWidth: "50px",
        maxWidth: "300px",

        headerAlign: "start",
        cellAlign: "center",
        editable: true,
        options: [
            { label: "아파트", value: "APARTMENT" },
            { label: "빌라", value: "VILLA" },
            { label: "오피스텔", value: "OFFICETEL" },
            { label: "원룸", value: "ONEROOM" },
            { label: "상가", value: "COMMERCIAL" },
            { label: "토지", value: "LAND" },
        ],

        render: (lead: Lead) => {
            const option = leadColumns.find(c => c.key === "property_type")?.options?.find(o => o.value === lead.property_type);
            return option?.label || lead.property_type;
        },
    },
    {
        key: "preferred_region",
        type: "text",
        name: "희망 지역",
        width: "150px",
        minWidth: "50px",
        maxWidth: "300px",
        headerAlign: "start",
        cellAlign: "center",
        editable: true,
        render: (lead: Lead) => lead.preferred_region || "",
    },
    {
        key: "email",
        type: "text",
        name: "이메일",
        width: "210px",
        minWidth: "50px",
        maxWidth: "300px",
        headerAlign: "start",
        cellAlign: "center",
        editable: true,
    },
    {
        key: "source",
        type: "select",
        name: "유입 경로",
        width: "120px",
        minWidth: "50px",
        maxWidth: "300px",
        headerAlign: "start",
        cellAlign: "center",
        editable: true,
        options: [
            { label: "직방", value: "ZIGBANG" },
            { label: "피터팬", value: "PETERPAN" },
            { label: "다방", value: "DABANG" },
            { label: "네이버", value: "NAVER" },
            { label: "블로그", value: "BLOG" },
            { label: "인스타그램", value: "INSTAGRAM" },
            { label: "문의 폼", value: "WEB_FORM" },
            { label: "유튜브", value: "YOUTUBE" },
            { label: "카카오", value: "KAKAO" },
            { label: "워크인", value: "WALKIN" },
            { label: "카페", value: "CAFE" },
            { label: "지인 추천", value: "REFERRAL" },
            { label: "기타", value: "ETC" },
        ],
        render: (lead: Lead) => {
            const option = leadColumns.find(c => c.key === "source")?.options?.find(o => o.value === lead.source);
            return option?.label || lead.source;
        },
    },
    {
        key: "deposit",
        type: "price",
        name: "보증금",
        width: "240px",
        minWidth: "50px",
        maxWidth: "300px",
        headerAlign: "start",
        cellAlign: "center",
        editable: true,
        getEditValue: (lead: Lead) => ({
            min: lead.deposit_min,
            max: lead.deposit_max,
        }),
        render: (lead: Lead) => {
            const min = lead.deposit_min;
            const max = lead.deposit_max;

            if (!min && !max) return "";
            if (min && !max) return `${min.toLocaleString()}만원~`;
            if (!min && max) return `0~${max.toLocaleString()}만원`;
            return `${min ? min.toLocaleString() : 0}만원~${
                max ? max.toLocaleString() : 0
            }만원`;
        },
    },
    {
        key: "price",
        type: "price",
        name: "금액",
        width: "240px",
        minWidth: "50px",
        maxWidth: "300px",
        headerAlign: "start",
        cellAlign: "center",
        editable: true,
        getEditValue: (lead: Lead) => ({
            min: lead.price_min,
            max: lead.price_max,
        }),
        render: (lead: Lead) => {
            const min = lead.price_min;
            const max = lead.price_max;

            if (!min && !max) return "";
            if (min && !max) return `${min.toLocaleString()}만원~`;
            if (!min && max) return `0~${max.toLocaleString()}만원`;
            return `${min ? min.toLocaleString() : 0}만원~${
                max ? max.toLocaleString() : 0
            }만원`;
        },
    },
    {
        key: "assignee",
        type: "select", // Assignee editing might need user list, but currently treated as string?
        name: "담당자",
        width: "120px",
        minWidth: "50px",
        maxWidth: "300px",
        headerAlign: "start",
        cellAlign: "center",
        editable: true,
        render: (lead: Lead) => lead.assignee,
    },
    {
        key: "message",
        type: "text",
        name: "문의 내용",
        width: "300px",
        minWidth: "250px",
        maxWidth: "500px",
        headerAlign: "start",
        cellAlign: "start",
        editable: true,
    },
    {
        key: "memo",
        type: "text",
        name: "메모",
        width: "300px",
        minWidth: "250px",
        maxWidth: "500px",
        headerAlign: "start",
        cellAlign: "start",
        editable: true,
    },
    {
        key: "recommendations",
        type: "text",
        name: (
            <div className="flex items-center gap-1">
                추천 매물
                <Tooltip position="bottom" content="활성화 상태의 매물 중 조건이 일치하는 매물을 추천합니다.">
                    <HelpCircle size={14} className="text-gray-400" />
                </Tooltip>
            </div>
        ),
        width: "150px",
        minWidth: "100px",
        maxWidth: "300px",
        headerAlign: "center",
        cellAlign: "start",
        editable: false,
        render: (lead: Lead) => {
             if (lead.recommendations === undefined) return "-";
             if (lead.recommendations === null) return "검색 중...";
             if (lead.recommendations.length === 0) return "없음";
             return <div className="text-(--primary) font-medium cursor-pointer">{lead.recommendations.length}건 매칭</div>;
        }
    },
    {
        key: "createdAt",
        type: "text",
        name: "등록일",
        width: "120px",
        minWidth: "50px",
        maxWidth: "300px",
        headerAlign: "start",
        cellAlign: "start",
        editable: false,
        render: (lead: Lead) => {
            return <div className="cursor-not-allowed">{formatDate(lead.created_at)}</div>
        },
    },
    {
        key: "updatedAt",
        type: "text",
        name: "수정일",
        width: "120px",
        minWidth: "50px",
        maxWidth: "300px",
        headerAlign: "start",
        cellAlign: "start",
        editable: false,
        render: (lead: Lead) => {
            return (
                <div className="cursor-not-allowed">{formatDate(lead.updated_at)}</div>
            )
        },
    },
    
];

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });
}


