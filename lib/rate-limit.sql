
-- Create rate_limits table
create table if not exists rate_limits (
  key text primary key,
  count int default 0,
  last_request bigint
);

-- Enable RLS (though for middleware usage we'll likely use service role key or RPC)
alter table rate_limits enable row level security;

-- Function to increment and check rate limit
create or replace function check_rate_limit(
  request_key text,
  limit_count int,
  window_ms bigint
)
returns boolean
language plpgsql
security definer
as $$
declare
  record_count int;
  last_req bigint;
  current_ms bigint;
begin
  current_ms := extract(epoch from now()) * 1000;
  
  -- Insert or update
  insert into rate_limits (key, count, last_request)
  values (request_key, 1, current_ms)
  on conflict (key) do update
  set 
    count = case 
      when (rate_limits.last_request + window_ms) < excluded.last_request then 1
      else rate_limits.count + 1
    end,
    last_request = excluded.last_request
  returning count into record_count;

  return record_count <= limit_count;
end;
$$;
