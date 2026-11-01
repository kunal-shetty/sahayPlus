-- =============================================================================
-- Sahay+ demo seed add-on: 2 Nov 2026 (Monday) becomes "today"
--
-- Run AFTER seed-oct15-nov1.sql. It moves the demo forward by one day:
--   * finishes 1 Nov (evening Atorvastatin taken) and closes that day
--   * Amlodipine refill picked up on 1 Nov evening (was down to 4 days)
--   * fills 2 Nov through the afternoon; the evening dose is left pending
--   * streak 5 -> 6 days
--
-- Safe to re-run: every insert skips rows that already exist.
-- All times are IST (Asia/Kolkata).
-- =============================================================================

begin;

-- relationship : 6bf08cde-e688-4991-8609-ae77bbeaf981
-- Harsh (care receiver) : 4b3d2d00-e4fa-437b-8abd-16cde56cb5f7
-- Kunal (caregiver)     : a145aa99-d6a4-4981-9582-f481d3226236

-- -----------------------------------------------------------------------------
-- 1. Finish 1 Nov: evening Atorvastatin taken at 21:06 by Harsh
-- -----------------------------------------------------------------------------
insert into public.medication_logs (medication_id, date, taken, taken_at, marked_by, created_at)
select '11111111-0000-4000-8000-000000000006', '2026-11-01', true,
       '2026-11-01 21:06:14+05:30', '4b3d2d00-e4fa-437b-8abd-16cde56cb5f7',
       '2026-11-01 21:06:14+05:30'
where not exists (
  select 1 from public.medication_logs
  where medication_id = '11111111-0000-4000-8000-000000000006' and date = '2026-11-01'
);

-- -----------------------------------------------------------------------------
-- 2. 2 Nov: morning + afternoon doses (same pattern as the main seed),
--    evening Atorvastatin still pending
-- -----------------------------------------------------------------------------
insert into public.medication_logs (medication_id, date, taken, taken_at, marked_by, created_at)
select
  m.id,
  '2026-11-02'::date,
  true,
  t.taken_at,
  case when abs(hashtext(m.id::text || '2026-11-02')) % 6 = 0
       then 'a145aa99-d6a4-4981-9582-f481d3226236'::uuid           -- Kunal marked it
       else '4b3d2d00-e4fa-437b-8abd-16cde56cb5f7'::uuid end,      -- Harsh marked it
  t.taken_at
from public.medications m
cross join lateral (
  select (('2026-11-02'::date + m.time) at time zone 'Asia/Kolkata')
         + ((abs(hashtext(m.id::text || '2026-11-02')) % 36) - 10) * interval '1 minute'
         + (abs(hashtext('2026-11-02' || m.name)) % 60) * interval '1 second' as taken_at
) t
where m.care_relationship_id = '6bf08cde-e688-4991-8609-ae77bbeaf981'
  and m.time_of_day <> 'evening'                                   -- tonight still pending
  and not exists (
    select 1 from public.medication_logs l
    where l.medication_id = m.id and l.date = '2026-11-02'
  );

-- medication_taken timeline events for the logs added above
insert into public.timeline_events (care_relationship_id, type, medication_id, note, actor_id, actor_type, created_at)
select
  '6bf08cde-e688-4991-8609-ae77bbeaf981',
  'medication_taken'::timeline_event_type,
  l.medication_id,
  null,
  l.marked_by,
  case when l.marked_by = 'a145aa99-d6a4-4981-9582-f481d3226236' then 'caregiver' else 'care_receiver' end::actor_type,
  l.taken_at + interval '1 second'
from public.medication_logs l
join public.medications m on m.id = l.medication_id
where m.care_relationship_id = '6bf08cde-e688-4991-8609-ae77bbeaf981'
  and (l.date = '2026-11-02'
       or (l.date = '2026-11-01' and m.time_of_day = 'evening'))
  and not exists (
    select 1 from public.timeline_events e
    where e.medication_id = l.medication_id
      and e.type = 'medication_taken'
      and e.created_at = l.taken_at + interval '1 second'
  );

-- -----------------------------------------------------------------------------
-- 3. Close 1 Nov (all 6 taken) + day_closed event
-- -----------------------------------------------------------------------------
insert into public.day_closures (care_relationship_id, date, closed_at, all_taken, total_meds, taken_count, closed_by)
select
  '6bf08cde-e688-4991-8609-ae77bbeaf981',
  l.date,
  '2026-11-01 22:41:00+05:30',
  bool_and(l.taken),
  count(*),
  count(*) filter (where l.taken),
  'a145aa99-d6a4-4981-9582-f481d3226236'
from public.medication_logs l
join public.medications m on m.id = l.medication_id
where m.care_relationship_id = '6bf08cde-e688-4991-8609-ae77bbeaf981'
  and l.date = '2026-11-01'
group by l.date
on conflict (care_relationship_id, date) do nothing;

insert into public.timeline_events (care_relationship_id, type, note, actor_id, actor_type, created_at)
select care_relationship_id, 'day_closed',
       'Day closed with ' || taken_count || '/' || total_meds || ' taken',
       closed_by, 'caregiver', closed_at
from public.day_closures c
where c.care_relationship_id = '6bf08cde-e688-4991-8609-ae77bbeaf981'
  and c.date = '2026-11-01'
  and not exists (
    select 1 from public.timeline_events e
    where e.care_relationship_id = c.care_relationship_id
      and e.type = 'day_closed' and e.created_at = c.closed_at
  );

-- Streak: 27 Oct -> 1 Nov all complete = 6 days; 18 days tracked (15 Oct -> 1 Nov)
update public.care_relationships
set current_streak = 6,
    longest_streak = greatest(longest_streak, 6),
    total_days_tracked = 18
where id = '6bf08cde-e688-4991-8609-ae77bbeaf981';

-- -----------------------------------------------------------------------------
-- 4. Amlodipine refill picked up Sunday evening (1 Nov)
-- -----------------------------------------------------------------------------
update public.medications
set refill_days_left = 30,
    updated_at = '2026-11-01 18:20:00+05:30'
where id = '11111111-0000-4000-8000-000000000003'
  and refill_days_left < 30;

update public.pharmacist_contacts
set last_refill_confirm = '2026-11-01 18:20:00+05:30'
where care_relationship_id = '6bf08cde-e688-4991-8609-ae77bbeaf981'
  and name = 'Apollo Pharmacy';

insert into public.timeline_events (care_relationship_id, type, note, actor_id, actor_type, created_at)
select '6bf08cde-e688-4991-8609-ae77bbeaf981', 'refill_noted',
       'Amlodipine refilled (30 days supply)',
       'a145aa99-d6a4-4981-9582-f481d3226236', 'caregiver', '2026-11-01 18:20:00+05:30'
where not exists (
  select 1 from public.timeline_events
  where care_relationship_id = '6bf08cde-e688-4991-8609-ae77bbeaf981'
    and type = 'refill_noted' and created_at = '2026-11-01 18:20:00+05:30'
);

-- -----------------------------------------------------------------------------
-- 5. Wellness check-in for 2 Nov + wellness_logged event
-- -----------------------------------------------------------------------------
insert into public.wellness_entries (care_relationship_id, user_id, date, level, note, created_at)
select '6bf08cde-e688-4991-8609-ae77bbeaf981', '4b3d2d00-e4fa-437b-8abd-16cde56cb5f7',
       '2026-11-02', 'okay', 'A little tired, slept late watching the match', '2026-11-02 10:18:00+05:30'
where not exists (
  select 1 from public.wellness_entries
  where care_relationship_id = '6bf08cde-e688-4991-8609-ae77bbeaf981' and date = '2026-11-02'
);

insert into public.timeline_events (care_relationship_id, type, note, actor_id, actor_type, created_at)
select '6bf08cde-e688-4991-8609-ae77bbeaf981', 'wellness_logged',
       'Feeling okay - A little tired, slept late watching the match',
       '4b3d2d00-e4fa-437b-8abd-16cde56cb5f7', 'care_receiver', '2026-11-02 10:18:01+05:30'
where not exists (
  select 1 from public.timeline_events
  where care_relationship_id = '6bf08cde-e688-4991-8609-ae77bbeaf981'
    and type = 'wellness_logged' and created_at = '2026-11-02 10:18:01+05:30'
);

-- -----------------------------------------------------------------------------
-- 6. Messages (1 Nov evening -> 2 Nov afternoon)
-- -----------------------------------------------------------------------------
-- The 1 Nov "I took my medicine" message has been seen by now
update public.messages
set is_read = true
where care_relationship_id = '6bf08cde-e688-4991-8609-ae77bbeaf981'
  and created_at < '2026-11-01 23:59:59+05:30';

insert into public.messages (care_relationship_id, from_user_id, text, is_read, created_at)
select v.crid, v.from_user, v.text, v.is_read, v.created_at::timestamptz
from (values
  ('6bf08cde-e688-4991-8609-ae77bbeaf981'::uuid, 'a145aa99-d6a4-4981-9582-f481d3226236'::uuid, 'Picked up your Amlodipine refill from Apollo, kept it on the dining table.', true,  '2026-11-01 18:25:00+05:30'),
  ('6bf08cde-e688-4991-8609-ae77bbeaf981'::uuid, '4b3d2d00-e4fa-437b-8abd-16cde56cb5f7'::uuid, 'Thank you beta!', true,  '2026-11-01 18:40:00+05:30'),
  ('6bf08cde-e688-4991-8609-ae77bbeaf981'::uuid, 'a145aa99-d6a4-4981-9582-f481d3226236'::uuid, '6 days in a row now Dada, well done!', true,  '2026-11-01 22:45:00+05:30'),
  ('6bf08cde-e688-4991-8609-ae77bbeaf981'::uuid, 'a145aa99-d6a4-4981-9582-f481d3226236'::uuid, 'Good morning! You said you are tired, take it easy today.', true,  '2026-11-02 10:30:00+05:30'),
  ('6bf08cde-e688-4991-8609-ae77bbeaf981'::uuid, '4b3d2d00-e4fa-437b-8abd-16cde56cb5f7'::uuid, 'Yes, will rest after lunch.', true,  '2026-11-02 10:52:00+05:30'),
  ('6bf08cde-e688-4991-8609-ae77bbeaf981'::uuid, '4b3d2d00-e4fa-437b-8abd-16cde56cb5f7'::uuid, 'I took my medicine', false, '2026-11-02 14:12:00+05:30')
) as v(crid, from_user, text, is_read, created_at)
where not exists (
  select 1 from public.messages m
  where m.care_relationship_id = v.crid and m.created_at = v.created_at::timestamptz
);

-- -----------------------------------------------------------------------------
-- 7. Caregiver notifications for doses Harsh confirmed himself
-- -----------------------------------------------------------------------------
insert into public.notifications (user_id, title, body, created_at, sent_at)
select 'a145aa99-d6a4-4981-9582-f481d3226236', 'Medication Taken',
       'Harsh took ' || m.name, l.taken_at + interval '2 seconds', l.taken_at + interval '1 second'
from public.medication_logs l
join public.medications m on m.id = l.medication_id
where m.care_relationship_id = '6bf08cde-e688-4991-8609-ae77bbeaf981'
  and l.taken and l.marked_by = '4b3d2d00-e4fa-437b-8abd-16cde56cb5f7'
  and (l.date = '2026-11-02'
       or (l.date = '2026-11-01' and m.time_of_day = 'evening'))
  and not exists (
    select 1 from public.notifications n
    where n.user_id = 'a145aa99-d6a4-4981-9582-f481d3226236'
      and n.created_at = l.taken_at + interval '2 seconds'
  );

commit;
