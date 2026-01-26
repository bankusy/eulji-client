export interface Lead {
    id: string;
    name: string;
    phone: string;
    email: string;
    stage: string;
    assignee: string; // 담당자 (표시용)
    property_type: string;
    transaction_type: string; // 월세, 전세, 매매
    deposit_min: number;
    deposit_max: number;
    price_min: number;
    price_max: number;
    message: string; // 문의 내용
    memo: string; // 메모
    source: string; // 유입 경로
    preferred_region?: string; // 희망 지역
    move_in_date?: string; // 입주 시기
    channel_meta?: Record<string, any>; // 채널 메타데이터
    converted_customer_id?: string; // 전환된 고객 ID
    created_at: string;
    updated_at: string;
    assigned_user_id?: string; // 담당자 ID
}

export interface TableColumn {
    key: string;
    type?: "text" | "select" | "date" | "phone" | "price" | "area" | "floor";
    name: string;
    sticky?: boolean;
    left?: number | string;
    width: string;
    minWidth: string;
    maxWidth: string;
    headerAlign: string;
    cellAlign: string;
    editable?: boolean;
    options?: { label: string; value: string }[];
    render?: (lead: Lead) => React.ReactNode;
    getEditValue?: (lead: Lead) => any;
}

export const columnsConfiguration: TableColumn[] = [
    {
        key: "name",
        type: "text",
        name: "이름",
        sticky: true,
        left: "48px", // 체크박스 width
        width: "120px",
        minWidth: "50px",
        maxWidth: "300px",
        headerAlign: "start",
        cellAlign: "start",
        editable: true,
        render: (lead: Lead) => lead.name,
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
        cellAlign: "start",
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
        cellAlign: "start",
        editable: true,
        options: [
            { label: "신규", value: "NEW" },
            { label: "진행 중", value: "IN_PROGRESS" },
            { label: "예약", value: "RESERVED" },
            { label: "계약 완료", value: "CONTRACTED" },
            { label: "계약 취소", value: "CANCELED" },
            { label: "계약 실패", value: "FAILED" },
        ],

        render: (lead: Lead) => {
            switch (lead.stage) {
                case "NEW":
                    return "신규";
                case "IN_PROGRESS":
                    return "진행 중";
                case "RESERVED":
                    return "예약";
                case "CONTRACTED":
                    return "계약 완료";
                case "CANCELED":
                    return "계약 취소";
                case "FAILED":
                    return "계약 실패";
                default:
                    return lead.stage;
            }
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
        cellAlign: "start",
        editable: true,
        options: [
            { label: "월세", value: "WOLSE" },
            { label: "전세", value: "JEONSE" },
            { label: "매매", value: "SALE" },
        ],
        render: (lead: Lead) => {
            switch (lead.transaction_type) {
                case "WOLSE":
                    return "월세";
                case "JEONSE":
                    return "전세";
                case "SALE":
                    return "매매";
                default:
                    return "";
            }
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
        cellAlign: "start",
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
            switch (lead.property_type) {
                case "APARTMENT":
                    return "아파트";
                case "VILLA":
                    return "빌라";
                case "OFFICETEL":
                    return "오피스텔";
                case "ONEROOM":
                    return "원룸";
                case "COMMERCIAL":
                    return "상가";
                case "LAND":
                    return "토지";
                default:
                    return "";
            }
        },
    },
    {
        key: "preferred_region",
        type: "text",
        name: "희망지역",
        width: "150px",
        minWidth: "50px",
        maxWidth: "300px",
        headerAlign: "start",
        cellAlign: "start",
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
        cellAlign: "start",
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
        cellAlign: "start",
        editable: true,
        options: [
            { label: "직방", value: "ZIGBANG" },
            { label: "다방", value: "DABANG" },
            { label: "네이버", value: "NAVER" },
            { label: "블로그", value: "BLOG" },
            { label: "문의 폼", value: "WEB_FORM" },
            { label: "유튜브", value: "YOUTUBE" },
            { label: "지인 추천", value: "REFERRAL" },
            { label: "카카오", value: "KAKAO" },
            { label: "기타", value: "ETC" },
        ],
        render: (lead: Lead) => {
            const map: Record<string, string> = {
                ZIGBANG: "직방",
                DABANG: "다방",
                NAVER: "네이버",
                BLOG: "블로그",
                WEB_FORM: "문의 폼",
                YOUTUBE: "유튜브",
                REFERRAL: "지인 추천",
                KAKAO: "카카오",
                ETC: "기타",
            };
            return map[lead.source] || lead.source;
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
        cellAlign: "start",
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
        cellAlign: "start",
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
        cellAlign: "start",
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
            return formatDate(lead.created_at);
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
