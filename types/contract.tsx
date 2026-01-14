import { ReactNode } from "react";

export type TransactionType = "SALE" | "JEONSE" | "WOLSE";
export type ContractStatus = "DRAFT" | "ACTIVE" | "TERMINATED" | "CANCELLED";

export interface Contract {
    id: string; // UUID
    agency_id: string; // UUID
    lead_id?: string; // UUID
    user_id?: string; // UUID - Responsible agent

    custom_id?: string; // Optional external/manual ID

    contract_date: string; // date string YYYY-MM-DD
    transaction_type: TransactionType;

    // Financials
    price?: number; // Sale price (Unit: KRW 10,000 if following lead convention, but contract usually exact. Assuming similar to lead for now)
    deposit?: number; // Deposit for Rent/Jeonse
    rent?: number; // Monthly rent

    status: ContractStatus;

    created_at: string; // ISO string
    updated_at: string; // ISO string
    lead?: {
        name: string;
        phone: string;
    } | null;
    [key: string]: any;
}

export type Align = "left" | "center" | "right";

export type SelectOption = {
    label: string;
    value: string;
};

export type ContractColumnConfig = {
    key: string;
    header: string;
    width?: number;
    minWidth?: number;
    maxWidth?: number;
    headerAlign?: Align;
    cellAlign?: Align;
    changeable: boolean;
    type: "select" | "input" | "date" | "text";
    contractKey?: EditableContractKey;
    headerColor?: string;
    cellColor?: string;
    options?: SelectOption[];
    render: (contract: Contract) => ReactNode;
};

export type EditableContractKey =
    | "custom_id"
    | "contract_date"
    | "transaction_type"
    | "price"
    | "deposit"
    | "rent"
    | "status";

export const contractColumns: ContractColumnConfig[] = [
    {
        key: "custom_id",
        header: "계약 번호",
        width: 120,
        minWidth: 100,
        maxWidth: 200,
        headerAlign: "center",
        cellAlign: "center",
        changeable: true,
        type: "input",
        contractKey: "custom_id",
        headerColor: "text-(--foreground)",
        cellColor: "text-(--foreground)",
        render: (c) => c.custom_id || <span className="text-(--foreground-muted) text-xs">입력필요</span>
    },
    {
        key: "lead_name",
        header: "고객명",
        width: 100,
        minWidth: 80,
        maxWidth: 150,
        headerAlign: "center",
        cellAlign: "center",
        changeable: false,
        type: "text",
        headerColor: "text-(--foreground)",
        cellColor: "text-(--foreground)",
        render: (c) => c.lead?.name || "-"
    },
    {
        key: "lead_phone",
        header: "연락처",
        width: 120,
        minWidth: 100,
        maxWidth: 180,
        headerAlign: "center",
        cellAlign: "center",
        changeable: false,
        type: "text",
        headerColor: "text-(--foreground)",
        cellColor: "text-(--foreground-muted)",
        render: (c) => c.lead?.phone || "-"
    },

    {
        key: "status",
        header: "상태",
        width: 100,
        minWidth: 80,
        headerAlign: "center",
        cellAlign: "center", // Financial usually right aligned
        changeable: true,
        type: "select",
        contractKey: "status",
        headerColor: "text-(--foreground)",
        cellColor: "text-(--foreground)",
        options: [
            { label: "작성중", value: "DRAFT" },
            { label: "진행중", value: "ACTIVE" },
            { label: "종료", value: "TERMINATED" },
            { label: "취소", value: "CANCELLED" },
        ],
        render: (c) => {
            switch (c.status) {
                case "DRAFT": return "작성중";
                case "ACTIVE": return "진행중";
                case "TERMINATED": return "종료";
                case "CANCELLED": return "취소";
                default: return c.status;
            }
        }
    },
    {
        key: "contract_date",
        header: "계약일",
        width: 120,
        minWidth: 100,
        maxWidth: 150,
        headerAlign: "center",
        cellAlign: "center",
        changeable: true,
        type: "date",
        contractKey: "contract_date",
        headerColor: "text-(--foreground)",
        cellColor: "text-(--foreground)",
        render: (c) => c.contract_date
    },
    {
        key: "transaction_type",
        header: "거래 유형",
        width: 100,
        minWidth: 80,
        maxWidth: 120,
        headerAlign: "center",
        cellAlign: "center",
        changeable: true,
        type: "select",
        contractKey: "transaction_type",
        headerColor: "text-(--foreground)",
        cellColor: "text-(--foreground)",
        options: [
            { label: "매매", value: "SALE" },
            { label: "전세", value: "JEONSE" },
            { label: "월세", value: "WOLSE" },
        ],
        render: (c) => {
            if (c.transaction_type === "SALE") return <span className="text-blue-500">매매</span>;
            if (c.transaction_type === "JEONSE") return <span className="text-green-500">전세</span>;
            if (c.transaction_type === "WOLSE") return <span className="text-orange-500">월세</span>;
            return c.transaction_type;
        }
    },
    {
        key: "amount",
        header: "금액(만원)",
        width: 220,
        minWidth: 150,
        maxWidth: 250,
        headerAlign: "center",
        cellAlign: "right", // Financial usually right aligned
        changeable: true, // Need special handling for composite edit? Or just separate columns?
        // Let's separate columns for editable simplicity or use a composite renderer
        type: "text", // Custom handling in table or specific columns
        headerColor: "text-(--foreground)",
        cellColor: "text-(--foreground)",
        render: (c) => {
            if (c.transaction_type === "SALE") return `${(c.price || 0).toLocaleString()}`;
            if (c.transaction_type === "JEONSE") return `${(c.deposit || 0).toLocaleString()}`;
            if (c.transaction_type === "WOLSE") return `${(c.deposit || 0).toLocaleString()} / ${(c.rent || 0).toLocaleString()}`;
            return "-";
        }
    },
    // We can add specific editable columns if we want direct edit
    {
        key: "price",
        header: "매매가(만원)",
        width: 220,
        minWidth: 150,
        maxWidth: 250,
        headerAlign: "center",
        cellAlign: "right", // Financial usually right aligned
        changeable: true,
        type: "input",
        contractKey: "price",
        headerColor: "text-(--foreground)",
        cellColor: "text-(--foreground)",
        render: (c) => c.transaction_type === 'SALE' ? (c.price || 0).toLocaleString() : '-'
    },
    {
        key: "deposit",
        header: "보증금(만원)",
        width: 220,
        minWidth: 150,
        maxWidth: 250,
        headerAlign: "center",
        cellAlign: "right", // Financial usually right aligned
        changeable: true,
        type: "input",
        contractKey: "deposit",
        headerColor: "text-(--foreground)",
        cellColor: "text-(--foreground)",
        render: (c) => c.transaction_type !== 'SALE' ? (c.deposit || 0).toLocaleString() : '-'
    },
    {
        key: "rent",
        header: "월세(만원)",
        width: 220,
        minWidth: 150,
        maxWidth: 250,
        headerAlign: "center",
        cellAlign: "right", // Financial usually right aligned
        changeable: true,
        type: "input",
        contractKey: "rent",
        headerColor: "text-(--foreground)",
        cellColor: "text-(--foreground)",
        render: (c) => c.transaction_type === 'WOLSE' ? (c.rent || 0).toLocaleString() : '-'
    },
    {
        key: "structure",
        header: "구조",
        width: 150,
        minWidth: 120,
        changeable: false, // Derived from lead/listing maybe? simpler for now
        type: "text",
        headerColor: "text-(--foreground)",
        cellColor: "text-(--foreground-muted)", // Less important
        render: (c) => "-" // Placeholder for now
    },

];
