export type AgencyUserRole = "OWNER" | "MEMBER";
export type AgencyUserStatus = "ACTIVE" | "INVITED" | "LEFT";

export interface Agency {
    id: string;
    name: string;
    license_no?: string | null;
    domain?: string | null;
    config?: Record<string, any>;
    created_at: string | null;
    
    // UI Helper - not in DB table directly but often joined
    role?: AgencyUserRole; 
    invite_code?: string; // Added for security
}

export interface AgencyUser {
    id: number; // bigserial
    agency_id: string;
    user_id: string;
    role: AgencyUserRole;
    status: AgencyUserStatus;
    title?: string | null;
    memo?: string | null;
    invited_at?: string | null;
    joined_at?: string | null;
    left_at?: string | null;
    created_at: string;
    updated_at: string;
    invited_by?: string | null;
    
    // Joined fields
    name?: string; // User name or Agency name depending on context
    email?: string;
}
