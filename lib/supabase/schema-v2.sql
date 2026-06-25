-- ============================================================
--  Romancelovesophy — schema v2 (run AFTER schema.sql)
--  Adds: channel header banner, marquee sponsor, AdSense,
--  view counts + analytics, viewer tags, roles/permissions,
--  editable site copy (per-element font + colour), custom fonts.
--  All statements are idempotent.
-- ============================================================

-- ── Settings: new columns ────────────────────────────────────
alter table settings add column if not exists header_image      text;     -- channel banner (no 5MB limit)
alter table settings add column if not exists header_focus_x    int default 50;  -- mobile focal point %
alter table settings add column if not exists sponsor_enabled   boolean default false;
alter table settings add column if not exists sponsor_text      text;
alter table settings add column if not exists sponsor_url       text;
alter table settings add column if not exists sponsor_font      text default 'serif';
alter table settings add column if not exists sponsor_color     text default '#c9b384';
alter table settings add column if not exists sponsor_bg        text default '#151515';
alter table settings add column if not exists sponsor_speed     text default 'normal';
alter table settings add column if not exists adsense_client    text;     -- ca-pub-XXXX
alter table settings add column if not exists ads_enabled       boolean default false;
alter table settings add column if not exists show_view_counts  boolean default true;
alter table settings add column if not exists allowed_tags      text[] default '{}';  -- up to 10 viewer tags
alter table settings add column if not exists shorts_enabled    boolean default true;
alter table settings add column if not exists videos_on_home    boolean default true;

-- ── Articles: public view counter ────────────────────────────
alter table articles add column if not exists views int default 0;

-- ── Quotes already have tags text[]; enforce max 2 in app layer ─

-- ── Profiles: roles / granular permissions ───────────────────
alter table profiles add column if not exists name        text;
alter table profiles add column if not exists permissions text[] default '{}';  -- e.g. {writings,quotes}
alter table profiles add column if not exists is_owner    boolean default false;

-- ── Editable site copy (key -> text + font + colour) ─────────
create table if not exists site_copy (
  key        text primary key,   -- e.g. 'home.hero_headline'
  value      text,
  font       text,               -- font family name
  color      text,               -- hex
  updated_at timestamptz default now()
);

-- ── Analytics: raw page views (aggregated for the dashboard) ─
create table if not exists page_views (
  id         bigint generated always as identity primary key,
  path       text,
  ref        text,
  created_at timestamptz default now()
);
create index if not exists page_views_time_idx on page_views (created_at);

-- ── Custom fonts uploaded by admin ───────────────────────────
create table if not exists fonts (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  file_path  text not null,      -- in 'fonts' bucket
  created_at timestamptz default now()
);

-- ── Storage buckets: header banner + fonts ───────────────────
insert into storage.buckets (id, name, public) values
  ('header','header', true),
  ('fonts','fonts', true)
on conflict (id) do nothing;

-- ── RLS ──────────────────────────────────────────────────────
alter table site_copy  enable row level security;
alter table page_views enable row level security;
alter table fonts      enable row level security;

create policy "public read site_copy"  on site_copy  for select using (true);
create policy "admin write site_copy"   on site_copy  for all using (is_admin()) with check (is_admin());

create policy "public insert page_views" on page_views for insert with check (true);
create policy "admin read page_views"    on page_views for select using (is_admin());

create policy "public read fonts" on fonts for select using (true);
create policy "admin write fonts" on fonts for all using (is_admin()) with check (is_admin());

-- storage read for new buckets
create policy "public read header+fonts" on storage.objects for select
  using (bucket_id in ('header','fonts'));

-- ── Seed: default viewer tags (only show publicly once a quote uses them) ─
update settings set allowed_tags = array['Love','Wisdom','Solitude']
where id = 1 and (allowed_tags is null or array_length(allowed_tags,1) is null);
