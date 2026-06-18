-- Supabase Migration: Aivones Schema Setup

-- Enable UUID extension if not enabled
create extension if not exists "uuid-ossp";

-- 1. Profiles Table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  full_name text,
  bio text,
  avatar_url text,
  social_links jsonb default '{}'::jsonb,
  theme_config jsonb default '{"bg_type": "gradient", "bg_value": "from-zinc-950 to-black", "link_style": "glass", "text_color": "text-zinc-100"}'::jsonb,
  is_admin boolean default false,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 2. Links Table (Links & Uploaded Media items)
create table if not exists public.links (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  url text,
  type text default 'link' not null, -- link, pdf, image, video, document
  media_url text,
  is_enabled boolean default true not null,
  sort_order integer default 0 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 3. Subscriptions Table
create table if not exists public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references public.profiles(id) on delete cascade unique not null,
  stripe_subscription_id text unique,
  status text default 'none' not null, -- none, active, trialing, canceled
  plan_type text default 'free' not null, -- free, pro
  current_period_end timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 4. Analytics Table
create table if not exists public.analytics (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  link_id uuid references public.links(id) on delete cascade,
  event_type text not null, -- view, click
  device_type text, -- desktop, mobile, tablet
  referral_source text, -- direct, google, twitter, etc
  created_at timestamptz default now() not null
);

-- 5. Coupons Table
create table if not exists public.coupons (
  id uuid default gen_random_uuid() primary key,
  code text unique not null,
  discount_percent integer not null,
  is_active boolean default true not null,
  created_at timestamptz default now() not null
);

-- Indices for performance optimization
create index if not exists profiles_username_idx on public.profiles(username);
create index if not exists links_profile_id_idx on public.links(profile_id);
create index if not exists links_sort_order_idx on public.links(sort_order);
create index if not exists subscriptions_profile_id_idx on public.subscriptions(profile_id);
create index if not exists analytics_profile_id_idx on public.analytics(profile_id);
create index if not exists analytics_link_id_idx on public.analytics(link_id);
create index if not exists analytics_created_at_idx on public.analytics(created_at);

-- Row Level Security (RLS) Setup
alter table public.profiles enable row level security;
alter table public.links enable row level security;
alter table public.subscriptions enable row level security;
alter table public.analytics enable row level security;
alter table public.coupons enable row level security;

-- RLS Policies: Profiles
create policy "Allow public read access to profiles" on public.profiles
  for select using (true);

create policy "Allow profiles update to owners" on public.profiles
  for update using (auth.uid() = id);

create policy "Allow admin full access to profiles" on public.profiles
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- RLS Policies: Links
create policy "Allow public select on enabled links" on public.links
  for select using (is_enabled = true);

create policy "Allow owners select all own links" on public.links
  for select using (auth.uid() = profile_id);

create policy "Allow owners insert own links" on public.links
  for insert with check (auth.uid() = profile_id);

create policy "Allow owners update own links" on public.links
  for update using (auth.uid() = profile_id);

create policy "Allow owners delete own links" on public.links
  for delete using (auth.uid() = profile_id);

create policy "Allow admin full access to links" on public.links
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- RLS Policies: Subscriptions
create policy "Allow owners select own subscription" on public.subscriptions
  for select using (auth.uid() = profile_id);

create policy "Allow owners update own subscription" on public.subscriptions
  for update using (auth.uid() = profile_id);

create policy "Allow admin full access to subscriptions" on public.subscriptions
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- RLS Policies: Analytics
create policy "Allow anyone to insert analytics" on public.analytics
  for insert with check (true);

create policy "Allow owners select own analytics" on public.analytics
  for select using (auth.uid() = profile_id);

create policy "Allow admin full access to analytics" on public.analytics
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- RLS Policies: Coupons
create policy "Allow anyone select active coupons" on public.coupons
  for select using (is_active = true);

create policy "Allow admin full access to coupons" on public.coupons
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- Automated Syncing Trigger between auth.users and public.profiles
create or replace function public.handle_new_user()
returns trigger
security definer set search_path = public
as $$
declare
  default_username text;
begin
  default_username := coalesce(
    new.raw_user_meta_data->>'username',
    split_part(new.email, '@', 1) || '_' || substring(new.id::text from 1 for 4)
  );

  insert into public.profiles (id, username, full_name, avatar_url, is_admin)
  values (
    new.id,
    default_username,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    coalesce((new.raw_user_meta_data->>'is_admin')::boolean, false)
  )
  on conflict (id) do update
  set
    username = excluded.username,
    full_name = excluded.full_name,
    avatar_url = excluded.avatar_url;

  insert into public.subscriptions (profile_id, status, plan_type)
  values (new.id, 'active', 'free')
  on conflict (profile_id) do nothing;

  return new;
end;
$$ language plpgsql;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Seed coupon data
insert into public.coupons (code, discount_percent, is_active)
values 
  ('WELCOME50', 50, true),
  ('FREEPRO', 100, true),
  ('AIVONES10', 10, true)
on conflict (code) do nothing;
