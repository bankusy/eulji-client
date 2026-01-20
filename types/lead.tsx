export interface Lead {
    id: string;
    name: string;
    phone: string;
    email: string;
    stage: string;
    assignee: string; // 담당자
    propertyType: string;
    transactionType: string; // 월세, 전세, 매매
    budget: Budget; // 예산
    message: string; // 문의 내용
    memo: string; // 메모
    source: string; // 유입 경로 (블로그, 카카오톡, 웹 사이트 등)
    createdAt: string;
    updatedAt: string;
    assigned_user_id?: string; // 담당자 ID
}

export interface Budget {
    priceMax: number;
    priceMin: number;
    depositMin: number;
    depositMax: number;
}

export interface TableColumn {
    key: string;
    type?: "text" | "select" | "date" | "phone";
    name: string;
    sticky?: boolean;
    left?: number | string;
    width: string;
    minWidth: string;
    maxWidth: string;
    headerAlign: string;
    cellAlign: string;
    changeable?: boolean;
    options?: { label: string; value: string }[];
    render?: (lead: Lead) => React.ReactNode;
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
        changeable: true,
        render: (lead: Lead) => lead.name,
    },
    {
        key: "stage",
        type: "select",
        name: "상태",
        sticky: true,
        left: "168px",
        width: "120px",
        minWidth: "50px",
        maxWidth: "300px",

        headerAlign: "start",
        cellAlign: "start",
        changeable: true,
        options: [
            { label: "신규", value: "NEW" },
            { label: "대기", value: "PENDING" },
            { label: "연락 시도", value: "TRYING" },
            { label: "상담 예정", value: "MEETING SOON" },
            { label: "상담 중", value: "CONSULTING" },
            { label: "가계약", value: "PROVISIONAL CONTRACT" },
            { label: "계약 완료", value: "SUCCESS" },
            { label: "리드 종료", value: "TERMINATING" },
        ],
        render: (lead: Lead) => {
            switch (lead.stage) {
                case "NEW":
                    return "신규";
                case "PENDING":
                    return "대기";
                case "TRYING":
                    return "연락 시도";
                case "CONSULTING":
                    return "상담 중";
                case "MEETING SOON":
                    return "상담 예정";
                case "PROVISIONAL CONTRACT":
                    return "가계약";
                case "SUCCESS":
                    return "계약 완료";
                case "TERMINATING":
                    return "리드 종료";
            }
        },
    },
    {
        key: "phone",
        type: "text",
        name: "휴대폰",
        sticky: true,
        left: "288px",
        width: "120px",
        minWidth: "50px",
        maxWidth: "300px",

        headerAlign: "start",
        cellAlign: "start",
        changeable: true,
        render: (lead: Lead) => {
            return lead.phone?.replace(
                /^(\d{2,3})(\d{3,4})(\d{4})$/,
                "$1-$2-$3"
            );
        },
    },
    {
        key: "transactionType",
        type: "select",
        name: "거래",
        sticky: true,
        left: "408px",
        width: "120px",
        minWidth: "50px",
        maxWidth: "300px",

        headerAlign: "start",
        cellAlign: "start",
        changeable: true,
        options: [
            { label: "월세", value: "WOLSE" },
            { label: "전세", value: "JEONSE" },
            { label: "매매", value: "SALE" },
        ],
        render: (lead: Lead) => {
            switch (lead.transactionType) {
                case "WOLSE":
                    return "월세";
                case "JEONSE":
                    return "전세";
                case "SALE":
                    return "매매";
            }
        },
    },
    {
        key: "propertyType",
        type: "select",
        name: "매물",
        width: "120px",
        minWidth: "50px",
        maxWidth: "300px",

        headerAlign: "start",
        cellAlign: "start",
        changeable: true,
        options: [
            { label: "오피스텔", value: "OFFICETEL" },
            { label: "원룸", value: "ONEROOM" },
            { label: "투룸", value: "TWOROOM" },
            { label: "쓰리룸", value: "THREEROOM" },
            { label: "아파트", value: "APART" },
            { label: "공장", value: "FACTORY" },
            { label: "상가", value: "MALL" },
            { label: "토지", value: "LAND" },
        ],

        render: (lead: Lead) => {
            switch (lead.propertyType) {
                case "OFFICETEL":
                    return "오피스텔";
                case "ONEROOM":
                    return "원룸";
                case "TWOROOM":
                    return "투룸";
                case "THREEROOM":
                    return "쓰리룸";
                case "APART":
                    return "아파트";
                case "FACTORY":
                    return "공장";
                case "MALL":
                    return "상가";
                case "LAND":
                    return "토지";
            }
        },
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
        changeable: true,
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
        changeable: true,
        options: [
            { label: "직방", value: "ZIGBANG" },
            { label: "다방", value: "DABANG" },
            { label: "네이버", value: "NAVER" },
            { label: "블로그", value: "BLOG" },
            { label: "유튜브", value: "YOUTUBE" },
            { label: "지인 추천", value: "REFERRAL" },
            { label: "카카오", value: "KAKAO" },
            { label: "직접 입력", value: "DIRECT" },
        ],
        render: (lead: Lead) => {
            const map: Record<string, string> = {
                ZIGBANG: "직방",
                DABANG: "다방",
                NAVER: "네이버",
                BLOG: "블로그",
                YOUTUBE: "유튜브",
                REFERRAL: "지인 추천",
                KAKAO: "카카오",
                DIRECT: "직접입력",
            };
            return map[lead.source] || lead.source;
        },
    },
    {
        key: "deposit",
        type: "text",
        name: "보증금",
        width: "240px",
        minWidth: "50px",
        maxWidth: "300px",

        headerAlign: "start",
        cellAlign: "start",
        changeable: true,
        render: (lead: Lead) => {
            const min = lead.budget.depositMin;
            const max = lead.budget.depositMax;

            if (!min && !max) return "-";
            if (min && !max) return `${min.toLocaleString()}만원~`;
            if (!min && max) return `0~${max.toLocaleString()}만원`;
            return `${min ? min.toLocaleString() : 0}만원~${
                max ? max.toLocaleString() : 0
            }만원`;
        },
    },
    {
        key: "price",
        type: "text",
        name: "금액",
        width: "240px",
        minWidth: "50px",
        maxWidth: "300px",

        headerAlign: "start",
        cellAlign: "start",
        changeable: true,
        render: (lead: Lead) => {
            const min = lead.budget.priceMin;
            const max = lead.budget.priceMax;

            if (!min && !max) return "-";
            if (min && !max) return `${min.toLocaleString()}만원~`;
            if (!min && max) return `0~${max.toLocaleString()}만원`;
            return `${min ? min.toLocaleString() : 0}만원~${
                max ? max.toLocaleString() : 0
            }만원`;
        },
    },
    {
        key: "assignee",
        type: "select",
        name: "담당자",
        width: "120px",
        minWidth: "50px",
        maxWidth: "300px",

        headerAlign: "start",
        cellAlign: "start",
        changeable: true,
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
        changeable: true,
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
        changeable: true,
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
        changeable: false,
        render: (lead: Lead) => {
            return formatDate(lead.createdAt);
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
        changeable: false,
        render: (lead: Lead) => {
            return formatDate(lead.updatedAt);
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
