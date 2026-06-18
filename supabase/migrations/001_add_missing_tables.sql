-- Migration 001: Add missing tables and columns
-- Run this in the Supabase SQL Editor

-- 1. Add is_admin column to profiles (if not exists)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- 2. Create subscriptions table (if not exists)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  stripe_subscription_id text UNIQUE,
  status text DEFAULT 'active' NOT NULL,
  plan_type text DEFAULT 'free' NOT NULL,
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- 3. Create coupons table (if not exists)
CREATE TABLE IF NOT EXISTS public.coupons (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code text UNIQUE NOT NULL,
  discount_percent integer NOT NULL CHECK (discount_percent >= 1 AND discount_percent <= 100),
  is_active boolean DEFAULT true NOT NULL,
  uses integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- 4. Create coupon_redemptions table to track who used what coupon
CREATE TABLE IF NOT EXISTS public.coupon_redemptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id uuid REFERENCES public.coupons(id) ON DELETE CASCADE NOT NULL,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  redeemed_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(coupon_id, profile_id)
);

-- 5. Add indices
CREATE INDEX IF NOT EXISTS subscriptions_profile_id_idx ON public.subscriptions(profile_id);
CREATE INDEX IF NOT EXISTS coupons_code_idx ON public.coupons(code);
CREATE INDEX IF NOT EXISTS coupon_redemptions_profile_idx ON public.coupon_redemptions(profile_id);

-- 6. Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies for subscriptions
DROP POLICY IF EXISTS "Allow owners select own subscription" ON public.subscriptions;
CREATE POLICY "Allow owners select own subscription" ON public.subscriptions
  FOR SELECT USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Allow owners update own subscription" ON public.subscriptions;
CREATE POLICY "Allow owners update own subscription" ON public.subscriptions
  FOR UPDATE USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Allow service role full access to subscriptions" ON public.subscriptions;
CREATE POLICY "Allow service role full access to subscriptions" ON public.subscriptions
  FOR ALL USING (true);

-- 8. RLS Policies for coupons
DROP POLICY IF EXISTS "Allow anyone select active coupons" ON public.coupons;
CREATE POLICY "Allow anyone select active coupons" ON public.coupons
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Allow admin full access to coupons" ON public.coupons;
CREATE POLICY "Allow admin full access to coupons" ON public.coupons
  FOR ALL USING (true);

-- 9. RLS Policies for coupon_redemptions
DROP POLICY IF EXISTS "Allow owners select own redemptions" ON public.coupon_redemptions;
CREATE POLICY "Allow owners select own redemptions" ON public.coupon_redemptions
  FOR SELECT USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Allow owners insert own redemptions" ON public.coupon_redemptions;
CREATE POLICY "Allow owners insert own redemptions" ON public.coupon_redemptions
  FOR INSERT WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Allow service role full access to coupon_redemptions" ON public.coupon_redemptions;
CREATE POLICY "Allow service role full access to coupon_redemptions" ON public.coupon_redemptions
  FOR ALL USING (true);

-- 10. Allow admins to update profiles (for granting admin)
DROP POLICY IF EXISTS "Allow admin full access to profiles" ON public.profiles;
CREATE POLICY "Allow admin full access to profiles" ON public.profiles
  FOR ALL USING (true);

-- 11. Update the handle_new_user trigger to also insert a subscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  default_username text;
BEGIN
  default_username := COALESCE(
    new.raw_user_meta_data->>'username',
    split_part(new.email, '@', 1) || '_' || substring(new.id::text FROM 1 FOR 6)
  );

  INSERT INTO public.profiles (id, username, full_name, avatar_url, is_admin)
  VALUES (
    new.id,
    default_username,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    COALESCE((new.raw_user_meta_data->>'is_admin')::boolean, false)
  )
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url;

  INSERT INTO public.subscriptions (profile_id, status, plan_type)
  VALUES (new.id, 'active', 'free')
  ON CONFLICT (profile_id) DO NOTHING;

  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 12. Seed default coupons
INSERT INTO public.coupons (code, discount_percent, is_active, uses)
VALUES 
  ('WELCOME50', 50, true, 0),
  ('FREEPRO', 100, true, 0),
  ('AIVONES10', 10, true, 0)
ON CONFLICT (code) DO NOTHING;

-- 13. Create subscriptions for all existing users who don't have one
INSERT INTO public.subscriptions (profile_id, status, plan_type)
SELECT p.id, 'active', 'free'
FROM public.profiles p
LEFT JOIN public.subscriptions s ON s.profile_id = p.id
WHERE s.profile_id IS NULL
ON CONFLICT (profile_id) DO NOTHING;
