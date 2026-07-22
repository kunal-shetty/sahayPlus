-- =============================================================================
-- Sahay+ — Supabase (Postgres) schema
-- Generated from docs/BACKEND_SCHEMA.md + lib/api.ts
-- Run this in the Supabase SQL editor (or via supabase db push).
-- =============================================================================

-- Required extensions -------------------------------------------------------
create extension if not exists "pgcrypto";   -- gen_random_uuid()
create extension if not exists "citext";     -- case-insensitive email

-- =============================================================================
-- ENUMS
-- =============================================================================

do $$ begin
  create type user_role           as enum ('caregiver', 'care_receiver', 'pharmacist');
exception when duplicate_object then null; end $$;

do $$ begin
  create type caregiver_status    as enum ('active', 'away', 'independent');
exception when duplicate_object then null; end $$;

do $$ begin
  create type time_of_day         as enum ('morning', 'afternoon', 'evening');
exception when duplicate_object then null; end $$;

do $$ begin
  create type timeline_event_type as enum (
    'medication_taken',
    'medication_skipped',
    'dose_changed',
    'medication_added',
    'medication_removed',
    'refill_noted',
    'note_added',
    'check_in',
    'day_closed',
    'wellness_logged',
    'voice_confirmed',
    'message_sent',
    'safety_check_triggered',
    'safety_check_dismissed',
    'safety_check_escalated',
    'fine_check_in',
    'help_requested',
    'handover_started',
    'handover_ended',
    'routine_changed'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type actor_type          as enum ('caregiver', 'care_receiver', 'pharmacist');
exception when duplicate_object then null; end $$;

do $$ begin
  create type note_link_type      as enum ('medication', 'day');
exception when duplicate_object then null; end $$;

do $$ begin
  create type wellness_level      as enum ('great', 'okay', 'not_great');
exception when duplicate_object then null; end $$;

do $$ begin
  create type safety_check_status as enum ('pending', 'dismissed', 'escalated');
exception when duplicate_object then null; end $$;

do $$ begin
  create type notification_type   as enum (
    'medication_reminder',
    'refill_warning',
    'safety_alert',
    'wellness_reminder',
    'message',
    'check_in_suggestion'
  );
exception when duplicate_object then null; end $$;

-- =============================================================================
-- 1. users
-- Public-profile table that mirrors auth.users (1:1).  The id column is
-- kept equal to auth.users.id so we can FK against it directly.
-- =============================================================================
create table if not exists public.users (
  id                  uuid        primary key references auth.users(id) on delete cascade,
  email               citext      unique not null,
  phone               varchar(20),
  name                varchar(100) not null,
  nickname            varchar(100),
  role                user_role,
  prefer_voice_confirm boolean    not null default false,
  push_token          text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists users_phone_idx on public.users (phone);

-- Keep updated_at fresh
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists trg_users_updated_at on public.users;
create trigger trg_users_updated_at
before update on public.users
for each row execute function public.tg_set_updated_at();

-- =============================================================================
-- 2. care_relationships
-- =============================================================================
create table if not exists public.care_relationships (
  id                  uuid              primary key default gen_random_uuid(),
  caregiver_id        uuid              not null references public.users(id) on delete cascade,
  alt_caregiver_id    uuid              references public.users(id) on delete set null,
  care_receiver_id    uuid              not null references public.users(id) on delete cascade,
  caregiver_status    caregiver_status  not null default 'active',
  away_until          timestamptz,
  independent_times   time_of_day[]     not null default '{}',
  current_streak      integer           not null default 0,
  longest_streak      integer           not null default 0,
  total_days_tracked  integer           not null default 0,
  created_at          timestamptz       not null default now(),
  -- A caregiver shouldn't be linked to the same care-receiver twice
  unique (caregiver_id, care_receiver_id)
);

create index if not exists cr_caregiver_idx     on public.care_relationships (caregiver_id);
create index if not exists cr_care_receiver_idx on public.care_relationships (care_receiver_id);
create index if not exists cr_alt_caregiver_idx on public.care_relationships (alt_caregiver_id);

-- =============================================================================
-- 3. medications
-- =============================================================================
create table if not exists public.medications (
  id                  uuid          primary key default gen_random_uuid(),
  care_relationship_id uuid         not null references public.care_relationships(id) on delete cascade,
  name                varchar(100)  not null,
  dosage              varchar(50),
  time_of_day         time_of_day   not null,
  time                time,
  notes               text,
  simple_explanation  text,
  refill_days_left    integer,
  pharmacist_note     text,
  is_active           boolean       not null default true,
  created_at          timestamptz   not null default now(),
  updated_at          timestamptz   not null default now()
);

create index if not exists medications_relationship_idx on public.medications (care_relationship_id);

drop trigger if exists trg_medications_updated_at on public.medications;
create trigger trg_medications_updated_at
before update on public.medications
for each row execute function public.tg_set_updated_at();

-- =============================================================================
-- 4. medication_logs
-- =============================================================================
create table if not exists public.medication_logs (
  id            uuid        primary key default gen_random_uuid(),
  medication_id uuid        not null references public.medications(id) on delete cascade,
  date          date        not null,
  taken         boolean     not null,
  taken_at      timestamptz,
  marked_by     uuid        references public.users(id) on delete set null,
  streak        integer,
  created_at    timestamptz not null default now()
);

create index if not exists med_logs_med_date_idx
  on public.medication_logs (medication_id, date desc);

-- =============================================================================
-- 5. timeline_events
-- =============================================================================
create table if not exists public.timeline_events (
  id                    uuid                 primary key default gen_random_uuid(),
  care_relationship_id  uuid                 not null references public.care_relationships(id) on delete cascade,
  type                  timeline_event_type  not null,
  medication_id         uuid                 references public.medications(id) on delete set null,
  note                  text,
  actor_id              uuid                 references public.users(id) on delete set null,
  actor_type            actor_type,
  created_at            timestamptz          not null default now()
);

create index if not exists timeline_rel_created_idx
  on public.timeline_events (care_relationship_id, created_at desc);
create index if not exists timeline_med_idx
  on public.timeline_events (medication_id);

-- =============================================================================
-- 6. contextual_notes
-- =============================================================================
create table if not exists public.contextual_notes (
  id                    uuid           primary key default gen_random_uuid(),
  care_relationship_id  uuid           not null references public.care_relationships(id) on delete cascade,
  text                  text           not null,
  linked_type           note_link_type not null,
  linked_medication_id  uuid           references public.medications(id) on delete cascade,
  linked_date           date,
  created_at            timestamptz    not null default now(),
  created_by            uuid           references public.users(id) on delete set null,
  -- Exactly one of the two linked_* fields must be set
  constraint notes_link_ck check (
    (linked_type = 'medication' and linked_medication_id is not null and linked_date is null) or
    (linked_type = 'day'        and linked_date           is not null and linked_medication_id is null)
  )
);

create index if not exists notes_rel_idx        on public.contextual_notes (care_relationship_id);
create index if not exists notes_med_idx         on public.contextual_notes (linked_medication_id);
create index if not exists notes_date_idx        on public.contextual_notes (linked_date);

-- =============================================================================
-- 7. day_closures
-- =============================================================================
create table if not exists public.day_closures (
  id                    uuid        primary key default gen_random_uuid(),
  care_relationship_id  uuid        not null references public.care_relationships(id) on delete cascade,
  date                  date        not null,
  closed_at             timestamptz not null default now(),
  all_taken             boolean     not null,
  total_meds            integer     not null default 0,
  taken_count           integer     not null default 0,
  closed_by             uuid        references public.users(id) on delete set null,
  unique (care_relationship_id, date)
);

create index if not exists day_closures_rel_idx on public.day_closures (care_relationship_id, date desc);

-- =============================================================================
-- 8. wellness_entries
-- =============================================================================
create table if not exists public.wellness_entries (
  id                    uuid           primary key default gen_random_uuid(),
  care_relationship_id  uuid           not null references public.care_relationships(id) on delete cascade,
  user_id               uuid           not null references public.users(id) on delete cascade,
  date                  date           not null,
  level                 wellness_level not null,
  note                  text,
  created_at            timestamptz    not null default now()
);

create index if not exists wellness_rel_date_idx
  on public.wellness_entries (care_relationship_id, date desc);

-- =============================================================================
-- 9. messages
-- =============================================================================
create table if not exists public.messages (
  id                    uuid        primary key default gen_random_uuid(),
  care_relationship_id  uuid        not null references public.care_relationships(id) on delete cascade,
  from_user_id          uuid        not null references public.users(id) on delete cascade,
  text                  text        not null,
  is_read               boolean     not null default false,
  created_at            timestamptz not null default now()
);

create index if not exists messages_rel_created_idx
  on public.messages (care_relationship_id, created_at desc);

-- =============================================================================
-- 10. emergency_contacts
-- =============================================================================
create table if not exists public.emergency_contacts (
  id                    uuid         primary key default gen_random_uuid(),
  care_relationship_id  uuid         not null references public.care_relationships(id) on delete cascade,
  name                  varchar(100) not null,
  relationship          varchar(50),
  phone                 varchar(20)  not null,
  is_primary            boolean      not null default false,
  created_at            timestamptz  not null default now()
);

create index if not exists em_contacts_rel_idx on public.emergency_contacts (care_relationship_id);

-- =============================================================================
-- 11. pharmacist_contacts
-- =============================================================================
create table if not exists public.pharmacist_contacts (
  id                    uuid         primary key default gen_random_uuid(),
  care_relationship_id  uuid         not null references public.care_relationships(id) on delete cascade,
  name                  varchar(100) not null,
  phone                 varchar(20),
  address               text,
  last_refill_confirm   timestamptz,
  note                  text,
  created_at            timestamptz  not null default now()
);

create index if not exists pharm_contacts_rel_idx on public.pharmacist_contacts (care_relationship_id);

-- =============================================================================
-- 12. handovers
-- =============================================================================
create table if not exists public.handovers (
  id                    uuid         primary key default gen_random_uuid(),
  care_relationship_id  uuid         not null references public.care_relationships(id) on delete cascade,
  from_caregiver_id     uuid         not null references public.users(id) on delete cascade,
  to_person_name        varchar(100) not null,
  start_date            timestamptz  not null default now(),
  end_date              timestamptz,
  is_active             boolean      not null default true,
  created_at            timestamptz  not null default now()
);

create index if not exists handovers_rel_active_idx
  on public.handovers (care_relationship_id, is_active);

-- =============================================================================
-- 13. safety_checks
-- =============================================================================
create table if not exists public.safety_checks (
  id                    uuid                 primary key default gen_random_uuid(),
  care_relationship_id  uuid                 not null references public.care_relationships(id) on delete cascade,
  status                safety_check_status  not null default 'pending',
  triggered_at          timestamptz          not null default now(),
  resolved_at           timestamptz,
  escalated_to          uuid                 references public.users(id) on delete set null
);

create index if not exists safety_checks_rel_status_idx
  on public.safety_checks (care_relationship_id, status);

-- =============================================================================
-- 14. notifications
-- =============================================================================
create table if not exists public.notifications (
  id         uuid              primary key default gen_random_uuid(),
  user_id    uuid              not null references public.users(id) on delete cascade,
  type       notification_type not null,
  title      varchar(200)      not null,
  body       text,
  created_at timestamptz       not null default now(),
  sent_at    timestamptz
);

create index if not exists notifications_user_idx
  on public.notifications (user_id, created_at desc);

-- =============================================================================
-- ROW-LEVEL SECURITY
-- Enable RLS on every public table and provide a permissive baseline so
-- the Next.js API routes (which use the service_role key) keep working,
-- and the anon key can read profiles.
-- =============================================================================

alter table public.users                enable row level security;
alter table public.care_relationships   enable row level security;
alter table public.medications          enable row level security;
alter table public.medication_logs      enable row level security;
alter table public.timeline_events      enable row level security;
alter table public.contextual_notes     enable row level security;
alter table public.day_closures         enable row level security;
alter table public.wellness_entries     enable row level security;
alter table public.messages             enable row level security;
alter table public.emergency_contacts   enable row level security;
alter table public.pharmacist_contacts  enable row level security;
alter table public.handovers            enable row level security;
alter table public.safety_checks        enable row level security;
alter table public.notifications        enable row level security;

-- users: each user can read & update their own row
drop policy if exists "users self read"   on public.users;
create policy "users self read" on public.users
  for select using (auth.uid() = id);

drop policy if exists "users self update" on public.users;
create policy "users self update" on public.users
  for update using (auth.uid() = id);

-- care_relationships: a user can see a relationship if they're the
-- primary caregiver, alt caregiver, or care receiver.
create or replace function public.is_in_relationship(relationship_id uuid)
returns boolean language sql stable as $$
  select exists (
    select 1 from public.care_relationships r
    where r.id = relationship_id
      and (r.caregiver_id = auth.uid()
           or r.alt_caregiver_id = auth.uid()
           or r.care_receiver_id = auth.uid())
  );
$$;

do $$
declare
  r record;
begin
  for r in
    select * from (values
      ('care_relationships', 'id'),
      ('medications',         'care_relationship_id'),
      ('medication_logs',     'medication_id'),   -- handled separately below
      ('timeline_events',     'care_relationship_id'),
      ('contextual_notes',    'care_relationship_id'),
      ('day_closures',        'care_relationship_id'),
      ('wellness_entries',    'care_relationship_id'),
      ('messages',            'care_relationship_id'),
      ('emergency_contacts',  'care_relationship_id'),
      ('pharmacist_contacts', 'care_relationship_id'),
      ('handovers',           'care_relationship_id'),
      ('safety_checks',       'care_relationship_id')
    ) as t(table_name, col)
  loop
    -- Skip tables that need a different policy (medication_logs)
    continue when r.table_name = 'medication_logs';

    execute format('drop policy if exists %I_select on public.%I', r.table_name, r.table_name);
    execute format(
      'create policy %I_select on public.%I for select using (public.is_in_relationship(%I))',
      r.table_name, r.table_name, r.col);
    execute format('drop policy if exists %I_write on public.%I', r.table_name, r.table_name);
    execute format(
      'create policy %I_write on public.%I for all using (public.is_in_relationship(%I)) with check (public.is_in_relationship(%I))',
      r.table_name, r.table_name, r.col, r.col);
  end loop;
end $$;

-- medication_logs is scoped via medication -> care_relationship
create or replace function public.is_in_relationship_for_med(med uuid)
returns boolean language sql stable as $$
  select exists (
    select 1
    from public.medications m
    join public.care_relationships r on r.id = m.care_relationship_id
    where m.id = med
      and (r.caregiver_id = auth.uid()
           or r.alt_caregiver_id = auth.uid()
           or r.care_receiver_id = auth.uid())
  );
$$;

drop policy if exists "medication_logs_select" on public.medication_logs;
create policy "medication_logs_select" on public.medication_logs
  for select using (public.is_in_relationship_for_med(medication_id));

drop policy if exists "medication_logs_write" on public.medication_logs;
create policy "medication_logs_write" on public.medication_logs
  for all using (public.is_in_relationship_for_med(medication_id))
  with check (public.is_in_relationship_for_med(medication_id));

-- notifications are per-user, not per-relationship
drop policy if exists "notifications self" on public.notifications;
create policy "notifications self" on public.notifications
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =============================================================================
-- AUTO-CREATE A public.users ROW ON SIGN-UP
-- =============================================================================

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, name, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name',''), null)
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists trg_on_auth_user_created on auth.users;
create trigger trg_on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- =============================================================================
-- DONE
-- =============================================================================
