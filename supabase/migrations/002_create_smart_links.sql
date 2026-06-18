-- Migration 002: Create smart_links table
-- Run this in your Supabase SQL Editor to fix the missing table error

CREATE TABLE IF NOT EXISTS public.smart_links (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  views integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Indices for fast lookups
CREATE INDEX IF NOT EXISTS smart_links_profile_id_idx ON public.smart_links(profile_id);
CREATE INDEX IF NOT EXISTS smart_links_slug_idx ON public.smart_links(slug);

-- Enable Row Level Security (RLS)
ALTER TABLE public.smart_links ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Allow public select on smart_links" ON public.smart_links;
CREATE POLICY "Allow public select on smart_links" ON public.smart_links
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow owners insert own smart_links" ON public.smart_links;
CREATE POLICY "Allow owners insert own smart_links" ON public.smart_links
  FOR INSERT WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Allow owners update own smart_links" ON public.smart_links;
CREATE POLICY "Allow owners update own smart_links" ON public.smart_links
  FOR UPDATE USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Allow owners delete own smart_links" ON public.smart_links;
CREATE POLICY "Allow owners delete own smart_links" ON public.smart_links
  FOR DELETE USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Allow admin full access to smart_links" ON public.smart_links;
CREATE POLICY "Allow admin full access to smart_links" ON public.smart_links
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );
