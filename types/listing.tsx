import { ReactNode } from "react";

export interface Listing {
    id: string; // UUID
    agency_id: string; // UUID
    assigned_user_id: string; // UUID

    // 기본 정보
    name: string; // 건물명 or 제목
    address: string; // 통합 주소 (사용자가 선택한 주소)
    address_detail?: string; // 상세주소

    // Daum Postcode API Data
    zonecode?: string;
    address_road?: string;
    address_jibun?: string;
    address_english?: string;
    bcode?: string;
    bname?: string;
    building_code?: string;
    building_name?: string;
    sido?: string;
    sigungu?: string;
    sigungu_code?: string;
    user_selected_type?: "R" | "J";

    // 매물 종류
    property_type: "APARTMENT" | "VILLA" | "OFFICETEL" | "ONEROOM" | "COMMERCIAL" | "LAND";

    // 거래 종류 & 가격
    transaction_type: "SALE" | "JEONSE" | "WOLSE";
    price_selling?: number; // 매매가 (만원)
    deposit?: number; // 보증금 (만원)
    rent?: number; // 월세 (만원)
    admin_fee?: number; // 관리비 (만원)

    // 면적
    area_supply_m2?: number; // 공급면적
    area_private_m2?: number; // 전용면적

    // 상세 정보
    floor?: number;
    total_floors?: number;
    room_count?: number;
    bathroom_count?: number;
    direction?: string;

    // 관리
    status: "AVAILABLE" | "CONTRACTED" | "CANCELED";
    owner_contact?: string; // 연락처
    memo?: string; // 관리자 메모

    created_at: string;
    updated_at: string;
    [key: string]: any;
}

export type ListingColumn = {
    key: string;
    name: string;
    width: string;
    minWidth: string;
    maxWidth: string;
    sticky?: boolean;
    headerAlign: string;
    cellAlign: string;
    render?: (item: Listing) => ReactNode;
    type?: "text" | "select" | "date" | "phone" | "price";
    options?: { label: string; value: string }[];
    editable?: boolean;
    getEditValue?: (item: Listing) => any;
};

export const listingColumns: ListingColumn[] = [
    {
        key: "address_detail",
        name: "상세 주소",
        width: "150px",
        minWidth: "100px",
        maxWidth: "250px",
        headerAlign: "start",
        cellAlign: "start",
        sticky: true,
        type: "text",
        editable: true,
        render: (item: Listing) => item.address_detail || "-"
    },
    {
        key: "status",
        name: "상태",
        width: "100px",
        minWidth: "80px",
        maxWidth: "150px",
        headerAlign: "left",
        cellAlign: "left",
        type: "select",
        editable: true,
        options: [
            { label: "진행중", value: "AVAILABLE" },
            { label: "거래완료", value: "CONTRACTED" },
            { label: "취소/보류", value: "CANCELED" },
        ],
        render: (item: Listing) => {
            switch (item.status) {
                case "AVAILABLE": return "진행중";
                case "CONTRACTED": return "거래완료";
                case "CANCELED": return "취소/보류";
                default: return item.status;
            }
        }
    },
    {
        key: "transaction_type",
        name: "거래 유형",
        width: "80px",
        minWidth: "60px",
        maxWidth: "100px",
        headerAlign: "left",
        cellAlign: "left",
        type: "select",
        editable: true,
        options: [
            { label: "매매", value: "SALE" },
            { label: "전세", value: "JEONSE" },
            { label: "월세", value: "WOLSE" },
        ],
        render: (item: Listing) => {
            switch (item.transaction_type) {
                case "SALE": return "매매";
                case "JEONSE": return "전세";
                case "WOLSE": return "월세";
                default: return "-";
            }
        }
    },
    {
        key: "price",
        name: "금액",
        width: "150px",
        minWidth: "120px",
        maxWidth: "200px",
        headerAlign: "end",
        cellAlign: "end",
        type: "price",
        editable: true,
        getEditValue: (item: Listing) => {
             if (item.transaction_type === "SALE") return { selling: item.price_selling };
             if (item.transaction_type === "JEONSE") return { deposit: item.deposit };
             if (item.transaction_type === "WOLSE") return { deposit: item.deposit, rent: item.rent };
             return {};
        },
        render: (item: Listing) => {
             if (item.transaction_type === "SALE") return `${(item.price_selling || 0).toLocaleString()}만원`;
             if (item.transaction_type === "JEONSE") return `${(item.deposit || 0).toLocaleString()}만원`;
             if (item.transaction_type === "WOLSE") return `${(item.deposit || 0).toLocaleString()}/${(item.rent || 0).toLocaleString()}만원`;
             return "-";
        }
    },
    {
        key: "property_type",
        name: "매물 종류",
        width: "100px",
        minWidth: "80px",
        maxWidth: "150px",
        headerAlign: "left",
        cellAlign: "left",
        type: "select",
        editable: true,
        options: [
            { label: "아파트", value: "APARTMENT" },
            { label: "빌라", value: "VILLA" },
            { label: "오피스텔", value: "OFFICETEL" },
            { label: "원룸", value: "ONEROOM" },
            { label: "상가", value: "COMMERCIAL" },
            { label: "토지", value: "LAND" },
        ],
        render: (item: Listing) => {
            switch (item.property_type) {
                case "APARTMENT": return "아파트";
                case "VILLA": return "빌라";
                case "OFFICETEL": return "오피스텔";
                case "ONEROOM": return "원룸";
                case "COMMERCIAL": return "상가";
                case "LAND": return "토지";
                default: return "-";
            }
        }
    },
    {
        key: "area", 
        name: "면적(공급/전용)",
        width: "120px",
        minWidth: "100px",
        maxWidth: "150px",
        headerAlign: "end",
        cellAlign: "end",
        type: "text",
        editable: true,
        getEditValue: (item: Listing) => ({ supply: item.area_supply_m2, private: item.area_private_m2 }),
        render: (item: Listing) => {
             // 0 check might hide valid 0, but unlikely for area.
             const supply = item.area_supply_m2 ? `${item.area_supply_m2}㎡` : "-";
             const priv = item.area_private_m2 ? `${item.area_private_m2}㎡` : "-";
             return `${supply}/${priv}`;
        }
    },
    {
        key: "floor",
        name: "층",
        width: "80px",
        minWidth: "60px",
        maxWidth: "100px",
        headerAlign: "left",
        cellAlign: "left",
        type: "text",
        editable: true,
        getEditValue: (item: Listing) => ({ floor: item.floor, total: item.total_floors }),
        render: (item: Listing) => {
            if (item.floor === undefined && item.total_floors === undefined) return "-";
            return `${item.floor || "-"} / ${item.total_floors || "-"}`;
        }
    },
    {
        key: "owner_contact",
        name: "연락처",
        width: "150px",
        minWidth: "120px",
        maxWidth: "200px",
        headerAlign: "start",
        cellAlign: "start",
        type: "phone",
        editable: true,
        render: (item: Listing) => {
             const phone = item.owner_contact;
             if (!phone) return "-";
             if (phone.length === 11) {
                 return `${phone.slice(0, 3)}-${phone.slice(3, 7)}-${phone.slice(7)}`;
             }
             return phone;
        }
    },
    {
        key: "memo",
        name: "메모",
        width: "200px",
        minWidth: "150px",
        maxWidth: "400px",
        headerAlign: "start",
        cellAlign: "start",
        type: "text",
        editable: true,
        render: (item: Listing) => item.memo || "-"
    },
    {
        key: "created_at",
        name: "등록일",
        width: "100px",
        minWidth: "80px",
        maxWidth: "150px",
        headerAlign: "left",
        cellAlign: "left",
        type: "date",
        render: (item: Listing) => new Date(item.created_at).toLocaleDateString()
    }
];
