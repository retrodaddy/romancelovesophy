-- "Doing Good" content type — same shape as `articles`, including the
-- unpublish_at column (which exists on articles/quotes in the live DB but
-- was never committed to the tracked schema files).
create table if not exists doing_good_posts (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  slug          text unique not null,
  excerpt       text,
  content_html  text,
  cover_image   text,
  category_id   uuid references categories(id) on delete set null,
  status        text not null default 'draft',
  reading_time  int,
  seo_title     text,
  seo_desc      text,
  published_at  timestamptz,
  unpublish_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists doing_good_posts_status_idx on doing_good_posts (status, published_at desc);

alter table doing_good_posts enable row level security;

create policy "public read doing_good_posts" on doing_good_posts
  for select using (status = 'published' or is_admin());

create policy "admin all doing_good_posts" on doing_good_posts
  for all using (is_admin()) with check (is_admin());

insert into storage.buckets (id, name, public) values
  ('doing-good-images', 'doing-good-images', true)
on conflict (id) do nothing;

-- Extend the existing public-read storage policy to include the new bucket.
drop policy if exists "public read storage" on storage.objects;
create policy "public read storage" on storage.objects for select
  using (bucket_id in ('quote-images','article-images','portraits','downloads','doing-good-images'));
