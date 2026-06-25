-- ============================================================
--  Romancelovesophy — schema v3 (contact inbox + threads)
--  Run AFTER schema.sql and schema-v2.sql. Idempotent.
-- ============================================================

-- Configurable contact subjects (brother can add more from admin)
alter table settings add column if not exists contact_subjects text[]
  default array['Discussion','Sharing Thoughts','Collab Requests'];
update settings
  set contact_subjects = array['Discussion','Sharing Thoughts','Collab Requests']
  where id = 1 and (contact_subjects is null or array_length(contact_subjects,1) is null);

-- Contact threads
create table if not exists contacts (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  email         text not null,
  phone         text,
  subject       text,
  status        text not null default 'new',   -- new | replied | closed
  is_read       boolean default false,
  created_at    timestamptz default now(),
  last_activity timestamptz default now()
);
create index if not exists contacts_activity_idx on contacts (last_activity desc);
create index if not exists contacts_subject_idx on contacts (subject);

-- Messages inside each thread
create table if not exists contact_messages (
  id         uuid primary key default gen_random_uuid(),
  contact_id uuid references contacts(id) on delete cascade,
  direction  text not null,                    -- inbound | outbound
  body       text not null,
  email_id   text,                             -- provider message id
  created_at timestamptz default now()
);
create index if not exists contact_messages_thread_idx on contact_messages (contact_id, created_at);

alter table contacts          enable row level security;
alter table contact_messages  enable row level security;

-- Writes happen via the server (service role); admins can read/manage.
create policy "admin all contacts"         on contacts         for all using (is_admin()) with check (is_admin());
create policy "admin all contact_messages" on contact_messages for all using (is_admin()) with check (is_admin());
