-- =============================================================================
-- Sahay+ — Database RESET (PART 1 of 2: drop everything)
--
-- ⚠️  DESTRUCTIVE: every row in every public table will be deleted.
-- The auth.users rows are left alone so Supabase Auth keeps working.
--
-- Run this in the Supabase SQL editor, then run schema.sql in the same
-- editor session to recreate everything.
-- =============================================================================

-- 1. Drop every RLS policy on public tables
do $$
declare
  r record;
begin
  for r in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
  loop
    execute format('drop policy if exists %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

-- 2. Drop triggers on public tables (including the auth-user one)
do $$
declare
  r record;
begin
  for r in
    select c.relname as table_name, t.tgname as trigger_name
    from pg_trigger t
    join pg_class c on c.oid = t.tgrelid
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and not t.tgisinternal
  loop
    execute format('drop trigger if exists %I on public.%I', r.trigger_name, r.table_name);
  end loop;
end $$;

drop trigger if exists trg_on_auth_user_created on auth.users;

-- 3. Drop helper functions (and any that depend on the dropped types)
drop function if exists public.tg_set_updated_at() cascade;
drop function if exists public.is_in_relationship(uuid) cascade;
drop function if exists public.is_in_relationship_for_med(uuid) cascade;
drop function if exists public.handle_new_user() cascade;

-- 4. Drop tables in FK-safe order (children first, parents last)
drop table if exists public.safety_checks        cascade;
drop table if exists public.handovers           cascade;
drop table if exists public.pharmacist_contacts cascade;
drop table if exists public.emergency_contacts  cascade;
drop table if exists public.messages            cascade;
drop table if exists public.wellness_entries    cascade;
drop table if exists public.day_closures        cascade;
drop table if exists public.contextual_notes    cascade;
drop table if exists public.timeline_events     cascade;
drop table if exists public.medication_logs     cascade;
drop table if exists public.medications         cascade;
drop table if exists public.care_relationships  cascade;
drop table if exists public.users               cascade;

-- 5. Drop enums (so the recreated types are clean and include any new values)
drop type if exists public.notification_type   cascade;
drop type if exists public.safety_check_status cascade;
drop type if exists public.wellness_level      cascade;
drop type if exists public.note_link_type      cascade;
drop type if exists public.actor_type          cascade;
drop type if exists public.timeline_event_type cascade;
drop type if exists public.time_of_day         cascade;
drop type if exists public.caregiver_status    cascade;
drop type if exists public.user_role           cascade;

-- =============================================================================
-- NEXT STEP: open supabase/schema.sql and run it in this same editor session
-- to recreate all tables, types, policies, and triggers from scratch.
-- =============================================================================