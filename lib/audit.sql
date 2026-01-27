
-- Create audit_logs table
create table if not exists audit_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  details jsonb,
  ip_address text,
  created_at timestamptz default now()
);

-- Enable RLS
alter table audit_logs enable row level security;

-- Policy: Only service role can insert (triggered by server side)
-- But we might want admins to read. For now, let's keep it restricted.
-- Actually, if we use authenticated client in API routes, we need policy allowing insert for authenticated users
-- Or better, stick to Service Role for writing audit logs to prevent tampering.

-- If we use Service Role in lib/audit.ts, we don't need Insert policies for public/authenticated roles.
-- But we might need Select policy for admins.

-- Let's assume we use Service Role to write.
