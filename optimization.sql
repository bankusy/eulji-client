-- 1. [CRITICAL] Performance Fix: Add missing indexes
-- 리드 조회 시 agency_id로 필터링하는 경우가 대부분이므로 필수입니다.
CREATE INDEX IF NOT EXISTS idx_leads_agency_id ON public.leads (agency_id);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_user_id ON public.leads (assigned_user_id);

-- 2. [PERFORMANCE] Flatten JSONB Budget to Numeric Columns
-- 범위 검색(Range Query) 속도 향상을 위해 JSONB를 일반 컬럼으로 분리합니다.

-- 2-1. 컬럼 추가
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS deposit_min numeric null,
ADD COLUMN IF NOT EXISTS deposit_max numeric null,
ADD COLUMN IF NOT EXISTS price_min numeric null,
ADD COLUMN IF NOT EXISTS price_max numeric null;

-- 2-2. 기존 데이터 마이그레이션 (JSON -> Column)
UPDATE public.leads
SET 
    deposit_min = (budget->>'depositMin')::numeric,
    deposit_max = (budget->>'depositMax')::numeric,
    price_min = (budget->>'priceMin')::numeric,
    price_max = (budget->>'priceMax')::numeric
WHERE budget IS NOT NULL;

-- 2-3. (Optional) 리드 테이블 조회 인덱스 추가 (예산 범위 검색용)
CREATE INDEX IF NOT EXISTS idx_leads_deposit_min ON public.leads (deposit_min);
CREATE INDEX IF NOT EXISTS idx_leads_deposit_max ON public.leads (deposit_max);
CREATE INDEX IF NOT EXISTS idx_leads_price_min ON public.leads (price_min);
CREATE INDEX IF NOT EXISTS idx_leads_price_max ON public.leads (price_max);

-- 3. [STRUCTURE] Standardize Enums for Listings
-- listings 테이블도 leads처럼 Enum 타입을 사용하도록 변경합니다.

-- 3-1. property_type 변경
ALTER TABLE public.listings 
ALTER COLUMN property_type TYPE public.property_type 
USING property_type::public.property_type;

-- 3-2. transaction_type 변경
ALTER TABLE public.listings 
ALTER COLUMN transaction_type TYPE public.transaction_type 
USING transaction_type::public.transaction_type;

-- 3-3. Drop redundant check constraints (Enum enforces this now)
ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_property_type_check;
ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_transaction_type_check;

-- Note: 이 스크립트를 실행하면 기존의 `budget` JSONB 컬럼을 사용하는 코드는 
-- 새로운 컬럼(`deposit_min` 등)을 사용하도록 수정해야 합니다.
