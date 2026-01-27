-- Enable pg_trgm for better text search (optional but recommended for address search)
create extension if not exists pg_trgm;

-- 1. Base Search Index (Composite)
-- Most queries filter by agency_id + status + transaction_type + property_type
-- This covers the common "Show me [Apartment] for [Jeonse] in [My Agency]" queries.
create index if not exists idx_listings_search_base 
on listings(agency_id, status, transaction_type, property_type);

-- 2. Budget Indexes (Range filters)
-- Used when filtering by "Deposit <= X" or "Price <= Y"
create index if not exists idx_listings_deposit on listings(deposit);
create index if not exists idx_listings_rent on listings(rent);
create index if not exists idx_listings_price_selling on listings(price_selling);

-- 3. Region Search Index (Address)
-- Basic B-Tree index helps with "Starts with" or exact match.
-- For "Contains" (%keyword%), pg_trgm GIN index is better.
-- Adding GIN index for address if pg_trgm is enabled.
create index if not exists idx_listings_address_trgm 
on listings using gin (address gin_trgm_ops);

create index if not exists idx_listings_address_detail_trgm 
on listings using gin (address_detail gin_trgm_ops);

-- Fallback B-Tree if GIN is too heavy or extension not strictly desired right now
create index if not exists idx_listings_address_btree on listings(address);
