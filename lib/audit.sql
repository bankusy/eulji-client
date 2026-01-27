
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
-- HOWEVER, if Service Role Key is missing in env (Common in dev), existing RLS blocks insert.
-- Allow 'authenticated' users to insert logs if Service key is not used.
create policy "Allow insert for authenticated users"
on audit_logs for insert
to authenticated
with check (true);

-- Also allow anon for critical tracking if needed, or stick to authenticated.
-- If API routes use Service Client, it bypasses RLS.
-- If API routes use User Client, RLS applies.
-- Current implementation tries Service Key, falls back to Anon Key.
-- If falling back to Anon Key (without user session context in createClient?) -> It acts as Anon.
-- Wait, lib/audit.ts uses createClient(url, key). It does NOT share the user session. 
-- So if falling back to ANON_KEY, it is TRULY ANON.
-- We must allow ANON insert or provide Service Key.

create policy "Allow insert for anon (server-side fallback)"
on audit_logs for insert
to anon
with check (true);

