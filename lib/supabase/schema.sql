-- ============================================================
--  Romancelovesophy — Supabase schema (run in SQL editor)
-- ============================================================
create extension if not exists "pgcrypto";

-- ── Admin allow-list ─────────────────────────────────────────
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text unique not null,
  role        text not null default 'admin',
  created_at  timestamptz not null default now()
);

-- ── Categories ───────────────────────────────────────────────
create table if not exists categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text unique not null,
  kind        text not null default 'both',
  description text,
  sort_order  int default 0,
  created_at  timestamptz not null default now()
);

-- ── Articles ─────────────────────────────────────────────────
create table if not exists articles (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  slug          text unique not null,
  excerpt       text,
  content_html  text,
  cover_image   text,
  category_id   uuid references categories(id) on delete set null,
  status        text not null default 'draft',
  source        text default 'native',
  reading_time  int,
  seo_title     text,
  seo_desc      text,
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists articles_status_idx on articles (status, published_at desc);

-- ── Quotes ───────────────────────────────────────────────────
create table if not exists quotes (
  id             uuid primary key default gen_random_uuid(),
  title          text,
  image_path     text not null,
  alt_text       text,
  caption        text,
  category_id    uuid references categories(id) on delete set null,
  tags           text[] default '{}',
  width          int,
  height         int,
  download_count int default 0,
  status         text not null default 'published',
  created_at     timestamptz not null default now()
);
create index if not exists quotes_status_idx on quotes (status, created_at desc);
create index if not exists quotes_tags_idx on quotes using gin (tags);

-- ── Downloads ────────────────────────────────────────────────
create table if not exists downloads (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  description    text,
  file_path      text not null,
  file_type      text,
  size_bytes     bigint,
  download_count int default 0,
  status         text not null default 'published',
  created_at     timestamptz not null default now()
);

-- ── Social links (data-driven) ───────────────────────────────
create table if not exists social_links (
  id          uuid primary key default gen_random_uuid(),
  platform    text not null,
  label       text not null,
  url         text not null,
  icon        text,
  description text,
  sort_order  int default 0,
  is_active   boolean default true,
  created_at  timestamptz not null default now()
);

-- ── Subscribers ──────────────────────────────────────────────
create table if not exists subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text unique not null,
  status     text not null default 'subscribed',
  source     text,
  confirmed  boolean default false,
  created_at timestamptz not null default now()
);

-- ── Enquiries ────────────────────────────────────────────────
create table if not exists enquiries (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  type       text default 'general',
  subject    text,
  message    text not null,
  is_read    boolean default false,
  created_at timestamptz not null default now()
);

-- ── Settings (single row, id = 1) ────────────────────────────
create table if not exists settings (
  id                 int primary key default 1,
  site_title         text default 'Romancelovesophy',
  hero_eyebrow       text default 'Classical wisdom · Modern influence',
  hero_headline      text default 'Where love meets philosophy',
  hero_sub           text default 'Quiet reflections on love, meaning, and the art of living.',
  about_md           text,
  portrait_path      text,            -- brother's photo (shown above featured quote)
  featured_quote_id  uuid references quotes(id),
  youtube_channel_id text,
  spotify_show_id    text default '49dcwx5qz045JY5jRrxxcF',
  spotify_episode_id text,            -- optional manual override
  updated_at         timestamptz not null default now()
);
insert into settings (id) values (1) on conflict (id) do nothing;

-- ── YouTube cache ────────────────────────────────────────────
create table if not exists videos_cache (
  id           text primary key,
  title        text,
  description  text,
  thumbnail    text,
  published_at timestamptz,
  fetched_at   timestamptz not null default now()
);

-- ============================================================
--  Row Level Security
-- ============================================================
alter table profiles      enable row level security;
alter table categories    enable row level security;
alter table articles      enable row level security;
alter table quotes        enable row level security;
alter table downloads     enable row level security;
alter table social_links  enable row level security;
alter table subscribers   enable row level security;
alter table enquiries     enable row level security;
alter table settings      enable row level security;
alter table videos_cache  enable row level security;

-- helper: is the current user an admin?
create or replace function is_admin() returns boolean
language sql security definer stable as $$
  select exists (select 1 from profiles where id = auth.uid());
$$;

-- Public read of published / active content
create policy "public read categories"   on categories   for select using (true);
create policy "public read articles"      on articles      for select using (status = 'published' or is_admin());
create policy "public read quotes"        on quotes        for select using (status = 'published' or is_admin());
create policy "public read downloads"     on downloads     for select using (status = 'published' or is_admin());
create policy "public read social"        on social_links  for select using (is_active or is_admin());
create policy "public read settings"      on settings      for select using (true);
create policy "public read videos_cache"  on videos_cache  for select using (true);

-- Public inserts (forms) only
create policy "public insert subscribers" on subscribers for insert with check (true);
create policy "public insert enquiries"   on enquiries   for insert with check (true);

-- Admin full access on everything
create policy "admin all profiles"     on profiles      for all using (is_admin()) with check (is_admin());
create policy "admin all categories"   on categories    for all using (is_admin()) with check (is_admin());
create policy "admin all articles"     on articles      for all using (is_admin()) with check (is_admin());
create policy "admin all quotes"       on quotes        for all using (is_admin()) with check (is_admin());
create policy "admin all downloads"    on downloads     for all using (is_admin()) with check (is_admin());
create policy "admin all social"       on social_links  for all using (is_admin()) with check (is_admin());
create policy "admin all subscribers"  on subscribers   for all using (is_admin()) with check (is_admin());
create policy "admin all enquiries"    on enquiries     for all using (is_admin()) with check (is_admin());
create policy "admin all settings"     on settings      for all using (is_admin()) with check (is_admin());
create policy "admin all videos_cache" on videos_cache  for all using (is_admin()) with check (is_admin());

-- ============================================================
--  Storage buckets (also creatable from the dashboard UI)
-- ============================================================
insert into storage.buckets (id, name, public) values
  ('quote-images','quote-images', true),
  ('article-images','article-images', true),
  ('portraits','portraits', true),
  ('downloads','downloads', true)
on conflict (id) do nothing;

-- Public read for these buckets; writes via service role only (server actions)
create policy "public read storage" on storage.objects for select
  using (bucket_id in ('quote-images','article-images','portraits','downloads'));

-- ============================================================
--  Seed: social links (edit/extend from the admin dashboard)
-- ============================================================
insert into social_links (platform, label, url, icon, description, sort_order) values
  ('youtube',  'YouTube',  'https://www.youtube.com/@Romancelovesophy', 'youtube',  'Films and reflections', 1),
  ('instagram','Instagram','https://www.instagram.com/romancelovesophy/', 'instagram','Daily thoughts and quotes', 2),
  ('pinterest','Pinterest','https://in.pinterest.com/Romancelovesophy/', 'pinterest','Curated quote collections', 3),
  ('spotify',  'Spotify',  'https://open.spotify.com/show/49dcwx5qz045JY5jRrxxcF', 'spotify', 'The podcast', 4)
on conflict do nothing;
