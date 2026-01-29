-- 1. 에이전시
create table public.agencies (
  id uuid not null default gen_random_uuid (),
  mode public.team_mode not null,
  name character varying(100) not null,
  license_no character varying(50) null,
  domain character varying null,
  config jsonb null default '{}'::jsonb,
  created_at timestamp with time zone null default now(),
  constraint agencies_pkey primary key (id)
) TABLESPACE pg_default;

-- 2. 에이전시 설정
create table public.agency_settings (
  agency_id uuid not null,
  workspace_name text null,g28
  brand_color text null,
  timezone text not null default 'Asia/Seoul'::text,
  locale text not null default 'ko-KR'::text,
  team_mode public.team_mode not null default 'SOLO'::team_mode,
  lead_pipeline jsonb not null default '{"stages": ["NEW", "IN_PROGRESS", "RESERVED", "CONTRACTED", "CANCELED", "FAILED"]}'::jsonb,
  lead_visibility_policy jsonb not null default '{"mode": "WORKSPACE_POLICY", "default": "PUBLIC"}'::jsonb,
  listing_settings jsonb not null default '{"default_status": "AVAILABLE", "default_property_types": ["APARTMENT", "VILLA", "OFFICETEL", "ONEROOM", "COMMERCIAL", "LAND"]}'::jsonb,
  notify_settings jsonb not null default '{"inbox": {"new_lead": true, "stale_lead_hours": 24}, "billing": {"trial_expiry_days_notice": [7, 3, 1]}, "contract": {"followup_days": 3}}'::jsonb,
  extra jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint agency_settings_pkey primary key (agency_id),
  constraint agency_settings_agency_id_fkey foreign KEY (agency_id) references agencies (id) on delete CASCADE
) TABLESPACE pg_default

create trigger trg_update_agency_settings_updated_at BEFORE
update on agency_settings for EACH row
execute FUNCTION update_agency_settings_updated_at ();

-- 3. 에이전시 구독 상태
create table public.agency_subscriptions (
  id uuid not null default gen_random_uuid (),
  agency_id uuid not null,
  plan_id text not null,
  status public.subscription_status not null,
  trial_started_at timestamp with time zone null,
  trial_ends_at timestamp with time zone null,
  current_period_start timestamp with time zone null,
  current_period_end timestamp with time zone null,
  auto_renew boolean not null default true,
  payment_provider text null,
  provider_customer_id text null,
  provider_subscription_id text null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint agency_subscriptions_pkey primary key (id),
  constraint agency_subscriptions_agency_id_fkey foreign KEY (agency_id) references agencies (id) on delete CASCADE,
  constraint agency_subscriptions_plan_id_fkey foreign KEY (plan_id) references plans (id)
) TABLESPACE pg_default;

create index IF not exists idx_agency_subscriptions_agency on public.agency_subscriptions using btree (agency_id) TABLESPACE pg_default;
create index IF not exists idx_subscriptions_agency on public.agency_subscriptions using btree (agency_id) TABLESPACE pg_default;

-- 4. 에이전시 사용자
create table public.agency_users (
  id bigserial not null,
  agency_id uuid not null,
  user_id uuid not null,
  role public.agency_role not null default 'MEMBER'::agency_role,
  status text not null default 'ACTIVE'::text,
  title text null,
  memo text null,
  invited_at timestamp with time zone null,
  joined_at timestamp with time zone null,
  left_at timestamp with time zone null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  invited_by uuid null,
  constraint agency_users_pkey primary key (id),
  constraint agency_users_agency_id_fkey foreign KEY (agency_id) references agencies (id),
  constraint agency_users_user_id_fkey foreign KEY (user_id) references users (id)
) TABLESPACE pg_default;

-- 5. 에이전시 초대
create table public.invitations (
  id uuid not null default gen_random_uuid (),
  agency_id uuid not null,
  code text not null,
  role public.agency_role not null default 'MEMBER'::agency_role,
  max_uses integer null,
  used_count integer not null default 0,
  is_active boolean not null default true,
  expires_at timestamp with time zone null,
  created_by uuid null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint invitations_pkey primary key (id),
  constraint invitations_code_key unique (code),
  constraint invitations_agency_id_fkey foreign KEY (agency_id) references agencies (id) on delete CASCADE,
  constraint invitations_created_by_fkey foreign KEY (created_by) references users (id) on delete set null
) TABLESPACE pg_default;

create index IF not exists idx_invitations_code on public.invitations using btree (code) TABLESPACE pg_default;
create index IF not exists idx_invitations_agency on public.invitations using btree (agency_id) TABLESPACE pg_default;

-- 6. 리드, 매물 중간 테이블
create table public.lead_listings (
  id uuid not null default gen_random_uuid (),
  agency_id uuid not null,
  lead_id uuid not null,
  listing_id uuid not null,
  relation_type public.lead_listing_relation not null default 'RECOMMENDED'::lead_listing_relation,
  memo text null,
  created_at timestamp with time zone not null default now(),
  constraint lead_listings_pkey primary key (id),
  constraint lead_listings_lead_id_listing_id_relation_type_key unique (lead_id, listing_id, relation_type),
  constraint lead_listings_agency_id_fkey foreign KEY (agency_id) references agencies (id) on delete CASCADE,
  constraint lead_listings_lead_id_fkey foreign KEY (lead_id) references leads (id) on delete CASCADE,
  constraint lead_listings_listing_id_fkey foreign KEY (listing_id) references listings (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_lead_listings_lead on public.lead_listings using btree (lead_id) TABLESPACE pg_default;
create index IF not exists idx_lead_listings_listing on public.lead_listings using btree (listing_id) TABLESPACE pg_default;
create index IF not exists idx_lead_listings_agency on public.lead_listings using btree (agency_id) TABLESPACE pg_default;

-- 7. 리드
create table public.leads (
  id uuid not null default gen_random_uuid (),
  agency_id uuid null,
  assigned_user_id uuid null,
  name character varying(100) null,
  phone character varying(50) null,
  email character varying(100) null,
  stage public.lead_stage not null default 'NEW'::lead_stage,
  source public.lead_source null default 'ETC'::lead_source,
  preferences jsonb null default '{}'::jsonb,
  converted_customer_id uuid null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  message text null,
  memo text null,
  budget jsonb null default '{}'::jsonb,
  property_type public.property_type null,
  transaction_type public.transaction_type null,
  deposit_min numeric null,
  deposit_max numeric null,
  price_min numeric null,
  price_max numeric null,
  move_in_date text null,
  preferred_region text null,
  created_by uuid null,
  channel_meta jsonb not null default '{}'::jsonb,
  preferred_type public.property_type null,
  preferred_budget jsonb not null default '{}'::jsonb,
  constraint leads_pkey primary key (id),
  constraint leads_agency_id_fkey foreign KEY (agency_id) references agencies (id),
  constraint leads_assigned_user_id_fkey foreign KEY (assigned_user_id) references users (id),
  constraint leads_created_by_fkey foreign KEY (created_by) references users (id)
) TABLESPACE pg_default;

create index IF not exists idx_leads_agency_id on public.leads using btree (agency_id) TABLESPACE pg_default;
create index IF not exists idx_leads_assigned_user_id on public.leads using btree (assigned_user_id) TABLESPACE pg_default;
create index IF not exists idx_leads_deposit_min on public.leads using btree (deposit_min) TABLESPACE pg_default;
create index IF not exists idx_leads_deposit_max on public.leads using btree (deposit_max) TABLESPACE pg_default;
create index IF not exists idx_leads_price_min on public.leads using btree (price_min) TABLESPACE pg_default;
create index IF not exists idx_leads_price_max on public.leads using btree (price_max) TABLESPACE pg_default;
create index IF not exists idx_leads_phone on public.leads using btree (phone) TABLESPACE pg_default
where
  (phone is not null);

create index IF not exists idx_leads_email on public.leads using btree (email) TABLESPACE pg_default
where
  (email is not null);

create index IF not exists idx_leads_budget on public.leads using gin (budget) TABLESPACE pg_default;
create index IF not exists idx_leads_property on public.leads using btree (property_type) TABLESPACE pg_default;
create index IF not exists idx_leads_transaction on public.leads using btree (transaction_type) TABLESPACE pg_default;
create index IF not exists idx_leads_preferences on public.leads using gin (preferences) TABLESPACE pg_default;
create index IF not exists idx_leads_agency_stage on public.leads using btree (agency_id, stage) TABLESPACE pg_default;
create index IF not exists idx_leads_agency_created_at on public.leads using btree (agency_id, created_at desc) TABLESPACE pg_default;

create trigger update_leads_updated_at BEFORE
update on leads for EACH row
execute FUNCTION update_updated_at_column ();

-- 8. 매물
create table public.listings (
  id uuid not null default gen_random_uuid (),
  agency_id uuid not null,
  assigned_user_id uuid null,
  name text not null,
  address text not null,
  address_detail text null,
  zonecode text null,
  address_road text null,
  address_jibun text null,
  address_english text null,
  bname text null,
  building_name text null,
  sido text null,
  sigungu text null,
  user_selected_type text null,
  property_type public.property_type null,
  transaction_type public.transaction_type null,
  price_selling numeric null,
  deposit numeric null,
  rent numeric null,
  admin_fee numeric null,
  area_supply_m2 numeric null,
  area_private_m2 numeric null,
  floor numeric null,
  total_floors numeric null,
  room_count numeric null,
  bathroom_count numeric null,
  direction text null,
  status public.listing_status null,
  owner_contact text null,
  memo text null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint listings_pkey primary key (id),
  constraint listings_user_selected_type_check check (
    (
      user_selected_type = any (array['R'::text, 'J'::text])
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_listings_property_type on public.listings using btree (property_type) TABLESPACE pg_default;
create index IF not exists idx_listings_status on public.listings using btree (status) TABLESPACE pg_default;
create index IF not exists idx_listings_agency_id on public.listings using btree (agency_id) TABLESPACE pg_default;
create index IF not exists idx_listings_transaction_type on public.listings using btree (transaction_type) TABLESPACE pg_default;
create index IF not exists idx_listings_search_base on public.listings using btree (
  agency_id,
  status,
  transaction_type,
  property_type
) TABLESPACE pg_default;

create index IF not exists idx_listings_price on public.listings using btree (price_selling) TABLESPACE pg_default;
create index IF not exists idx_listings_deposit on public.listings using btree (deposit) TABLESPACE pg_default;
create index IF not exists idx_listings_rent on public.listings using btree (rent) TABLESPACE pg_default;
create index IF not exists idx_listings_price_selling on public.listings using btree (price_selling) TABLESPACE pg_default;
create index IF not exists idx_listings_address_trgm on public.listings using gin (address gin_trgm_ops) TABLESPACE pg_default;
create index IF not exists idx_listings_address_detail_trgm on public.listings using gin (address_detail gin_trgm_ops) TABLESPACE pg_default;
create index IF not exists idx_listings_address_btree on public.listings using btree (address) TABLESPACE pg_default;
create index IF not exists idx_listings_agency on public.listings using btree (agency_id) TABLESPACE pg_default;
create index IF not exists idx_listings_type_tx on public.listings using btree (agency_id, property_type, transaction_type) TABLESPACE pg_default;
create index IF not exists idx_listings_agency_created_at on public.listings using btree (agency_id, created_at desc) TABLESPACE pg_default;

-- 9. 플랜
create table public.plans (
  id text not null,
  name text not null,
  description text null,
  price_monthly numeric not null default 0,
  currency text not null default 'KRW'::text,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  max_users bigint null,
  constraint plans_pkey primary key (id)
) TABLESPACE pg_default;

-- 10. 요청 제한

create table public.rate_limits (
  key text not null,
  count integer null default 0,
  last_request bigint null,
  constraint rate_limits_pkey primary key (key)
) TABLESPACE pg_default;

-- 11. 사용자 OAuth 2.0 정보
create table public.user_identities (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  provider text not null,
  provider_user_id text not null,
  constraint user_identities_pkey primary key (id),
  constraint user_identities_provider_provider_user_id_key unique (provider, provider_user_id),
  constraint user_identities_user_id_fkey foreign KEY (user_id) references users (id) on delete CASCADE
) TABLESPACE pg_default;

-- 12. 사용자 프로필
create table public.users (
  id uuid not null default gen_random_uuid (),
  email character varying(255) not null,
  name character varying(50) not null,
  status character varying(20) null default 'ACTIVE'::character varying,
  created_at timestamp with time zone null default now(),
  nickname character varying(50) null,
  avatar_url text null,
  bio text null,
  phone character varying(50) null,
  constraint users_pkey primary key (id),
  constraint users_email_key unique (email)
) TABLESPACE pg_default;