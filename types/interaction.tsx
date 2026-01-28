export type InteractionType = 'CALL' | 'VISIT' | 'MESSAGE' | 'NOTE' | 'SYSTEM';

export interface Interaction {
    id: string; // UUID
    agency_id: string; // UUID
    lead_id?: string; // UUID
    customer_id?: string; // UUID
    contract_id?: string; // UUID
    created_by?: string; // UUID (User ID)
    type: InteractionType;
    content?: string;
    raw_input?: string;
    meta_data?: Record<string, any>;
    created_at: string; // ISO String
}
