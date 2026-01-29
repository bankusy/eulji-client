export interface Invitation {
    id: string;
    agency_id: string;
    code: string;
    role: "OWNER" | "ADMIN" | "MEMBER";
    max_uses: number | null;
    used_count: number;
    is_active: boolean;
    expires_at: string | null;
    created_by: string | null;
    created_at: string;
    updated_at: string;
}
