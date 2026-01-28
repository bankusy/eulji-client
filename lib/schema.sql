-- 1. Users & Auth
CREATE TABLE if not exists users (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email           varchar(255) UNIQUE NOT NULL,
  name            varchar(100) NOT NULL,
  password_hash   text NOT NULL,
  avatar_url      text,
  kakao_url       text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE if not exists user_identities (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider        text NOT NULL,
  provider_user_id text NOT NULL,
  UNIQUE (provider, provider_user_id)
);

-- 2. Agencies (Workspaces)
CREATE TABLE if not exists agencies (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        varchar(100) NOT NULL,
  domain      varchar(255),
  license_no  varchar(50),
  kakao_url   text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- 3. Agency Users
DO $$ BEGIN
    CREATE TYPE agency_role AS ENUM ('OWNER','ADMIN','MEMBER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE if not exists agency_users (
  id          bigserial PRIMARY KEY,
  agency_id   uuid NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role        agency_role NOT NULL DEFAULT 'MEMBER',
  status      text NOT NULL DEFAULT 'ACTIVE',
  title       text,
  memo        text,
  invited_at  timestamptz,
  joined_at   timestamptz,
  left_at     timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (agency_id, user_id)
);

-- 4. Agency Settings
DO $$ BEGIN
    CREATE TYPE team_mode AS ENUM ('SOLO','TEAM_WITH_ADMIN','TEAM_NO_ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE if not exists agency_settings (
  agency_id      uuid PRIMARY KEY REFERENCES agencies(id) ON DELETE CASCADE,
  workspace_name text,
  brand_color    text,
  timezone       text NOT NULL DEFAULT 'Asia/Seoul',
  locale         text NOT NULL DEFAULT 'ko-KR',
  team_mode      team_mode NOT NULL DEFAULT 'SOLO',
  lead_pipeline  jsonb NOT NULL DEFAULT '{"stages":["NEW","IN_PROGRESS","RESERVED","CONTRACTED","CANCELED","FAILED"]}',
  lead_visibility_policy jsonb NOT NULL DEFAULT '{"mode":"WORKSPACE_POLICY","default":"PUBLIC"}',
  listing_settings jsonb NOT NULL DEFAULT '{"default_status":"AVAILABLE","default_property_types":["APARTMENT","VILLA","OFFICETEL","ONEROOM","COMMERCIAL","LAND"]}',
  notify_settings jsonb NOT NULL DEFAULT '{"inbox":{"new_lead":true,"stale_lead_hours":24},"contract":{"followup_days":3},"billing":{"trial_expiry_days_notice":[7,3,1]}}',
  extra          jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- 5. Leads (Note: Requires customers table for converted_customer_id, so creating Customer first or adding FK later.
-- For simplicity, let's create Customer table definition first if possible, but schema order in doc was Lead -> Customer.
-- I'll stick to doc order but handle FK carefully or expect user to run in order.
-- Wait, schema doc has Customers AFTER Leads.
-- So leads table creation will fail if it references customers(id) immediately.
-- Solution: Create Customers table first or move it up.)

-- Moving Customers up for dependency resolution
CREATE TABLE if not exists customers (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id   uuid NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  name        varchar(100) NOT NULL,
  phone       varchar(50) NOT NULL,
  resident_no varchar(100),
  memo        text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (agency_id, phone)
);

-- Now Leads
DO $$ BEGIN
    CREATE TYPE lead_stage AS ENUM ('NEW','IN_PROGRESS','RESERVED','CONTRACTED','CANCELED','FAILED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE lead_source AS ENUM ('NAVER','ZIGBANG','DABANG','PETERPAN','BLOG','INSTAGRAM','WEB_FORM','YOUTUBE','KAKAO','CAFE','WALKIN','REFERRAL','ETC');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE if not exists leads (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id         uuid NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  created_by        uuid REFERENCES users(id),
  name              varchar(100),
  phone             varchar(50),
  email             varchar(100),
  stage             lead_stage NOT NULL DEFAULT 'NEW',
  source            lead_source NOT NULL DEFAULT 'ETC',
  channel_meta      jsonb NOT NULL DEFAULT '{}'::jsonb,
  preferred_type    text, -- Using text instead of enum to avoid coupling issues or 'public.property_type'
  preferred_budget  jsonb NOT NULL DEFAULT '{}'::jsonb,
  preferred_region  text,
  move_in_date      text,
  message           text,
  memo              text,
  assigned_user_id  uuid REFERENCES users(id),
  converted_customer_id uuid REFERENCES customers(id), -- Now this works
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX if not exists idx_leads_agency_stage ON leads(agency_id, stage);
CREATE INDEX if not exists idx_leads_phone ON leads(phone) WHERE phone IS NOT NULL;
CREATE INDEX if not exists idx_leads_email ON leads(email) WHERE email IS NOT NULL;

-- 6. Listings
DO $$ BEGIN
    CREATE TYPE property_type AS ENUM ('APARTMENT','VILLA','OFFICETEL','ONEROOM','COMMERCIAL','LAND');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE transaction_type AS ENUM ('SALE','JEONSE','WOLSE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE listing_status AS ENUM ('AVAILABLE','CONTRACTED','CANCELED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE if not exists listings (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id       uuid NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  created_by      uuid REFERENCES users(id),
  assigned_user_id uuid REFERENCES users(id),
  name            text NOT NULL,
  address         text NOT NULL,
  address_detail  text,
  zonecode        text,
  address_road    text,
  address_jibun   text,
  sido            text,
  sigungu         text,
  property_type   property_type NOT NULL,
  transaction_type transaction_type NOT NULL,
  status          listing_status NOT NULL DEFAULT 'AVAILABLE',
  price_selling   numeric,
  deposit         numeric,
  rent            numeric,
  admin_fee       numeric,
  area_supply_m2  numeric,
  area_private_m2 numeric,
  floor           integer,
  total_floors    integer,
  room_count      integer,
  bathroom_count  integer,
  direction       text,
  owner_contact   text,
  memo            text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX if not exists idx_listings_agency ON listings(agency_id);
CREATE INDEX if not exists idx_listings_status ON listings(agency_id, status);
CREATE INDEX if not exists idx_listings_type_tx ON listings(agency_id, property_type, transaction_type);

-- 7. Lead-Listing Relations (Recommendations)
DO $$ BEGIN
    CREATE TYPE lead_listing_relation AS ENUM ('RECOMMENDED','VIEWED','CONTRACT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE if not exists lead_listings (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id     uuid NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  lead_id       uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  listing_id    uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  relation_type lead_listing_relation NOT NULL DEFAULT 'RECOMMENDED',
  memo          text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (lead_id, listing_id, relation_type)
);

CREATE INDEX if not exists idx_lead_listings_lead ON lead_listings(lead_id);
CREATE INDEX if not exists idx_lead_listings_listing ON lead_listings(listing_id);

-- 8. Contracts
CREATE TABLE if not exists contracts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id     uuid NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  lead_id       uuid REFERENCES leads(id) ON DELETE SET NULL,
  customer_id   uuid REFERENCES customers(id) ON DELETE SET NULL,
  listing_id    uuid REFERENCES listings(id) ON DELETE SET NULL,
  custom_id     varchar(100),
  contract_date date NOT NULL DEFAULT current_date,
  transaction_type transaction_type NOT NULL,
  price         numeric,
  deposit       numeric,
  rent          numeric,
  status        varchar(50) NOT NULL DEFAULT 'DRAFT',
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX if not exists idx_contracts_agency ON contracts(agency_id);

-- 9. Interactions
DO $$ BEGIN
    CREATE TYPE interaction_type AS ENUM ('CALL','VISIT','MESSAGE','NOTE','SYSTEM');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE if not exists interactions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id   uuid NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  lead_id     uuid REFERENCES leads(id) ON DELETE SET NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  contract_id uuid REFERENCES contracts(id) ON DELETE SET NULL,
  created_by  uuid REFERENCES users(id),
  type        interaction_type NOT NULL,
  content     text,
  raw_input   text,
  meta_data   jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX if not exists idx_interactions_lead ON interactions(lead_id);
CREATE INDEX if not exists idx_interactions_customer ON interactions(customer_id);

-- 10. Plans & Subs
CREATE TABLE if not exists plans (
  id             text PRIMARY KEY,
  name           text NOT NULL,
  description    text,
  price_monthly  numeric NOT NULL DEFAULT 0,
  currency       text NOT NULL DEFAULT 'KRW',
  is_active      boolean NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now()
);

DO $$ BEGIN
    CREATE TYPE subscription_status AS ENUM ('TRIAL','ACTIVE','PAST_DUE','CANCELED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE if not exists agency_subscriptions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id         uuid NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  plan_id           text NOT NULL REFERENCES plans(id),
  status            subscription_status NOT NULL,
  trial_started_at  timestamptz,
  trial_ends_at     timestamptz,
  current_period_start timestamptz,
  current_period_end   timestamptz,
  auto_renew        boolean NOT NULL DEFAULT true,
  payment_provider  text,
  provider_customer_id   text,
  provider_subscription_id text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX if not exists idx_subscriptions_agency ON agency_subscriptions(agency_id);
